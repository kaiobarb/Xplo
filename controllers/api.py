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
            image_url=request.vars.url
        )

        heat_id = db.user_stories_heatmap.insert(
            latitude=request.vars.lat,
            longitude=request.vars.lng,
            title=request.vars.title,
            body=request.vars.body,
        )
    pass
    # rows = db(db.user_stories.location != None).select()
    return response.json(dict(story=dict(
        id=t_id,
        latitude=request.vars.lat,
        longitude=request.vars.lng,
        created_by=auth.user_id,
        title=request.vars.title,
        body=request.vars.body,
        image_url=request.vars.url
    )))


def delete_story():
    # db((db.user_stories.latitude == request.vars.lat) & (db.user_stories.longitude == request.vars.lng)).delete()
    db(db.user_stories.id == request.vars.post_id).delete()
    return "ok"


def get_all_stories():
    stories = []

    rows = db().select(db.user_stories.ALL, orderby=~db.user_stories.created_on)

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


def get_heatmap_data():
    heatmap_locations = []

    rows = db().select(db.user_stories_heatmap.ALL)

    for r in rows:
        pos = dict(
            lat=r.latitude,
            long=r.longitude
        )
        heatmap_locations.append(pos)

    return response.json(dict(
        heatmap_locations=heatmap_locations
    ))


def add_comment():
    print "in comments"
    if request.vars is not None:
        c_id = db.comments.insert(
            post_id=request.vars.post_id,
            body=request.vars.comment_text
        )
    return response.json(dict(comment=dict(
        id=c_id,
        created_by=auth.user_id,
        post_id=request.vars.post_id,
        body=request.vars.comment_text,
    )))
    # print "in com "
    # return "k"


def get_comments():
    print "getting comments "
    comments = []
    rows = db(db.comments.post_id == request.vars.post_id).select()

    for r in rows:
        comments.append(r)

    return response.json(dict(
        comments=comments
    ))
