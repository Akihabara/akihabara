Generating Documentation
========================

We are using JSDoc 3 for documentation generating.
The JSDoc was added as a git submodule, to use it just execute:

`git submodule init`
`git submodule update`

The JSDoc 3 repository will be downloaded and you could generate the documentation
executing the following command on the doc folder:

`./jsdoc/jsdoc ../src`

The documentation will be generated on the out directory.
