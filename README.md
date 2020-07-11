# openrmf-web
The web UI for the openRMF tool. Documentation is here: https://github.com/Cingulara/openrmf-docs

This is based on the Pike Admin Bootstrap 4 beautiful design at https://www.pikeadmin.com/demo/index.html. 

## Building the Help
`bundle exec jekyll build` you run from the ./help/ directory to build a _site subdirectory. This _site subdirectory is put into the /help/ area of the NGINX container for the OpenRMF Web UI. 

I always remove the ./help/_site/ subdirectory with `rm -fr ./site` before I regenerate the static HTML help files.