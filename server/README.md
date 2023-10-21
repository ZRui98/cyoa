# cyoa server

## fastify api

## adventures

adventures are conceptually json files which store the possible paths and story information that is required. There is also a database table for adventures which keeps track of the summary information. The idea is that the json file does not need an api call from the cyoa server to get the json file to play the adventure. All that is simply needed is the file name and author, and it should be fetchable from the r2 storage under the folder ${user}/${adventure}/${adventure-name}.json. This is to minimize the number of lambda calls to fetch a story.

## assets

assets are elements displayable to an adventure node, such as text, audio, video, or images. There are 2 types: external resources, which are stored outside of cyoa, and internal ones, which are stored in the r2 storage under ${user}/assets. There is also an association table that describes which assets are used in which adventures. If an asset gets updated (reuploaded under a different file name, asset name changes, etc), it should then find all the associated stories who use this asset, and then update the json file(?).
