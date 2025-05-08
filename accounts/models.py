from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator


class User(models.Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=150, unique=True)
    email = fields.CharField(max_length=254, null=True, unique=True)
    full_name = fields.CharField(max_length=254, null=True)
    user_type = fields.CharField(max_length=50, default='default')
    hashed_password = fields.CharField(max_length=128)
    created_by = fields.IntField()
    created_at = fields.DatetimeField(auto_now_add=True)


# Pydantic models auto-generated from ORM model
User_Pydantic = pydantic_model_creator(User, name='User')
UserIn_Pydantic = pydantic_model_creator(User, name='UserIn', exclude=('id', 'hashed_password', 'created_by')) 