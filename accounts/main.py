import os
from fastapi import FastAPI, HTTPException, status, Request, Response, Header
from tortoise.contrib.fastapi import register_tortoise

from auth import verify_password, get_password_hash
from datastructures import UsernamePasswordForm, UserForm, UserUpdateForm

from models import User, User_Pydantic

app = FastAPI()
PROTECTED_USER_IDS = [1, 2]


@app.post('/api/login', status_code=status.HTTP_201_CREATED)
async def login(form_data: UsernamePasswordForm):
    user_in_db = await User.filter(username=form_data.username).first()

    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found with this username.',
        )

    verified = verify_password(form_data.password, user_in_db.hashed_password)
    if not verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Password is wrong.',
        )

    return await User_Pydantic.from_tortoise_orm(user_in_db)


@app.post('/api/users', status_code=status.HTTP_201_CREATED)
async def create_user(user: UserForm,
                      request: Request, response: Response,
                      request_user_id: str = Header(None)):

    user_in_db = await User.filter(username=user.username).first()
    if user_in_db:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='There is already another user with this username.',
        )

    user_in_db = await User.filter(email=user.email).first()
    if user_in_db:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='There is already another user with this email.',
        )

    hashed_password = get_password_hash(user.password)
    data = user.dict()
    data.update({
        'hashed_password': hashed_password,
        'created_by': request_user_id
    })

    user_obj = await User.create(**data)
    return await User_Pydantic.from_tortoise_orm(user_obj)


@app.get('/api/users', status_code=status.HTTP_200_OK)
async def get_users(request: Request, response: Response,
                    request_user_id: str = Header(None)):
    users = await User_Pydantic.from_queryset(User.all())
    return users


@app.get('/api/users/{user_id}', status_code=status.HTTP_200_OK)
async def get_user(user_id: int, request: Request, response: Response,
                   request_user_id: str = Header(None)):

    user_in_db = await User.filter(id=user_id).first()
    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found with this id.',
        )
    return await User_Pydantic.from_tortoise_orm(user_in_db)


@app.delete('/api/users/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, request: Request, response: Response,
                      request_user_id: str = Header(None)):

    if user_id in PROTECTED_USER_IDS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are not allowed to delete protected users.',
        )

    user_in_db = await User.filter(id=user_id).first()
    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found with this id.',
        )
    await User.filter(id=user_id).delete()


@app.put('/api/users/{user_id}', status_code=status.HTTP_200_OK)
async def update_user(user_id: int, user: UserUpdateForm,
                      request: Request, response: Response,
                      request_user_id: str = Header(None)):

    user_in_db = await User.filter(id=user_id).first()
    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='There is already another user with this username.',
        )

    update_data = user.dict(exclude_unset=True)
    if update_data:
        await User.filter(id=user_id).update(**update_data)
    user_in_db = await User.filter(id=user_id).first()
    return await User_Pydantic.from_tortoise_orm(user_in_db)


# ---------------------------------------------------------------------------
# Tortoise ORM initialisation
# ---------------------------------------------------------------------------

register_tortoise(
    app,
    db_url=os.getenv('DATABASE_URL'),
    modules={'models': ['models']},
    generate_schemas=True,
    add_exception_handlers=True,
)
