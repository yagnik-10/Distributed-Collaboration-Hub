from tortoise import Tortoise, run_async
import os

async def init():
    #  Here we create a SQLite DB using file "db.sqlite3"
    #  also specify the app name of "models"
    #  which contain models from "models"
    await Tortoise.init(
        db_url=os.getenv('DATABASE_URL'),
        modules={'models': ['models']}
    )
    # Generate the schema
    await Tortoise.generate_schemas()

# run_async is a helper function to run simple async Tortoise scripts.
run_async(init())
