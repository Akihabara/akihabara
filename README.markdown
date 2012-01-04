Akihabara
=========

Akihabara is a set of libraries, tools and presets to create pixelated indie-style 8/16-bit era games in Javascript that runs in your browser without any Flash plugin, making use of a small small small subset of the HTML5 features, that are actually available on many modern browsers.

Notes for developers
--------------------

* For maximum compatibility make sure that you're using the ["name"] for when setting object properties with reserved names like "goto" and "data" (Discovered during patching for Wii)
* Also do not use the comma after the last element of an array or a property of an object. Still work on many browsers but is broken for Opera Wii. (and probably IE, when will be supported)
* For making sure that your sub-scripts are loaded, try to add an "alert" at the end. Opera for Wii silently fail when there are syntax errors like the one explained before.
* Opera Wii wants that canvas have to be blitted at least once before being used - or fails with a browser crash! The built-in gbox.createCanvas was already fixed. Is a good thing to use that method for spawning canvas.

Notes about audio features
--------------------------
* Firefox stable has little audio caching problem/slowdowns and sometime freezes - can't figure out if is plugin's fault. Seems fixed on nightly builds. Audio is not marked as experimental.
* For compatibility with Safari, every audio file used for games MUST be more than 1.5 seconds long. Add silence to reach the 1.5secs length.
* Safari is having troubles on downloading audio for unknown reasons. Seems fixed on nightly builds. For now AUDIO IS EXPERIMENTAL.

Todo
----

* Some way for updating the JSDoc automatically. (Darren and Darius wrapped up tutorials and docs! - BTW some scripts for generating docs form sources are needed)
* Better embeddability keeping playability on mobile
* Solve randomly blinking sprites on Wii (?)

Improvement
-----------

* Audio compatibility *Work in progress*

Nice to have
----

* Networking

Mailing List
------------

* http://groups.google.com.br/group/akihabara-engine

Wiki
----

* For more informations follow our [Wiki](https://github.com/akihabara/akihabara/wiki)
