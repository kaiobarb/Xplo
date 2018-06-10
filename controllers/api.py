import tempfile

from gluon.utils import web2py_uuid


def add_story():
    print "here"
    if request.vars is not None:
        t_id = db.user_stories.insert(
            latitude=request.vars.lat,
            longitude=request.vars.lng,
            title=request.vars.title,
            body=request.vars.body,
        )
    pass
    # rows = db(db.user_stories.location != None).select()
    return response.json(dict(story=dict(
        latitude=request.vars.lat,
        longitude=request.vars.lng,
        created_by=auth.user_id,
        title=request.vars.title,
        body=request.vars.body,
    )))


def get_all_stories():
    stories = []

    rows = db().select(db.user_stories.ALL)

    for r in rows:
        stories.append(r)

    return response.json(dict(
        stories=stories
    ))
