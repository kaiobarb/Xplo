# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime


def get_user_email():
    return auth.user.email if auth.user is not None else None


db.define_table('user_stories',
                Field('created_on', 'datetime', default=request.now),
                Field('created_by', 'reference auth_user', default=auth.user_id),
                Field('title', 'text'),
                Field('body', 'text'),
                Field('latitude'),
                Field('longitude')
                )

# ignore this one. may be used when/if we do the heatmap. This will just hold all the markers you add
db.define_table('user_stories_heatmap',
                Field('created_on', 'datetime', default=request.now),
                Field('created_by', 'reference auth_user', default=auth.user_id),
                Field('title', 'text'),
                Field('body', 'text'),
                Field('latitude'),
                Field('longitude')
                )

# db.checklist.user_email.writable = False
# db.checklist.user_email.readable = False
# db.checklist.updated_on.writable = db.checklist.updated_on.readable = False
# db.checklist.id.writable = db.checklist.id.readable = False


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
