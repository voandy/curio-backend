# CURIO

## Creators

- [Andy Vo](https://github.com/voandy)
- [Nick Ang](https://github.com/nickangmc)
- [Christian Sugianto](https://github.com/christianhadinata)
- [Shaun Soong](https://github.com/Shankskun)

## About

This is a repository for the backend server of the Curio platform. Please see the main repository for more details about the platform.

https://github.com/christianhadinata/it-project-frontend

## API Routes

Bold signifies a required field.

### User Routes

Get all users
- GET "api/user"

Get user by id
- GET "api/user/id/:id"

Delete user by id
- DELETE "api/user/id/:id"

Update user by id
- PUT "api/user/id/:id"
- BODY {fieldsToUpdate: updatedValue}

Get user by email
- GET "api/user/email/:email"

Get user by username
- GET "api/user/username/:username"

Register new user
- POST "api/register"
- BODY {**email**, String, **username**: String, **name**: String, **password**: String, profilePic: String}

Login/authenticate a user
- POST "api/login"
- BODY {**email**: String, **password**: String}

Delete all unprotected users
- DELETE "api/user/deleteAll"

Get all the groups this user in a member of
- GET "api/user/id/:id/groups"

Get user by email or username
- GET "api/user/idOrEmail/:idOrEmail"

POST a comment about the user
- POST "api/user/posterId/:posterId/postedOnId/:postedOnId"
- BODY {**posterId**: String, **postedOfId**: String, **content**: String}

Get all comments about this user
- GET "api/user/id/:id/comments"

Search for users by search terms
- PUT "/user/search"
- BODY {**searchTerms**: String}

### Artefact Routes

### Group Routes

### Comment Routes

### Other Routes