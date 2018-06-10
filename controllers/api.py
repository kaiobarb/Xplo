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


def search():
    phrase = str(request.vars.search_phrase)
    print "search for: ", phrase

    results = []

    rows = db((db.user_stories.title.contains(phrase)) | (db.user_stories.body.contains(phrase))).select()

    for r in rows:
        results.append(r)

    return response.json(dict(
        results=results
    ))
