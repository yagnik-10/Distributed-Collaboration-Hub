import os
import asyncio

from tortoise import Tortoise

from auth import get_password_hash
from models import User


async def seed():
    await Tortoise.init(
        db_url=os.getenv('DATABASE_URL'),
        modules={'models': ['models']},
    )
    await Tortoise.generate_schemas()

    await User.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'full_name': 'Administrator',
            'user_type': 'admin',
            'hashed_password': get_password_hash('a'),
            'created_by': 1,
        },
    )
    print('Admin user ensured.')
    await Tortoise.close_connections()


if __name__ == '__main__':
    asyncio.run(seed()) 