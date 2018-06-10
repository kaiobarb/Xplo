import tempfile

from gluon.utils import web2py_uuid

def add_story():
	print "here"
	if request.vars is not None:
		t_id = db.user_stories.insert(
            latitude = request.vars.lat,
            longitude = request.vars.lng,
        )
	pass
	# rows = db(db.user_stories.location != None).select()
	return response.json(dict(story=dict(
		latitude = request.vars.lat,
		longitude = request.vars.lng,
	) ) )

def delete_story():
	db((db.user_stories.latitude == request.vars.lat) & (db.user_stories.longitude == request.vars.lng)).delete()
	return "ok"
