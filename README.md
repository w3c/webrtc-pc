
Web Real-Time Communications Spec
=================================

[Editor's Copy](https://w3c.github.io/webrtc-pc/)

To Reflow the Spec
------------------

To format the draft use something like 

tidy -config config.tidy < webrtc.html > new.html 

(you can find tidy at https://github.com/w3c/tidy-html5) 

To Generate a Version
---------------------

To generate the dated version of the specification:

* If releasing a getusermedia draft, in getusermedia.js update the
  "prevED" line to point to the previous dated draft (i.e., the one
  currently available as the editor's draft on dev.w3.org).

* If releasing a webrtc draft, in webrtc.js update the "prevED" line
  to point to the previous dated draft (i.e., the one currently
  available as the editor's draft on dev.w3.org).

* Create a new directory in archives corresponding to the new release
day (YYYYMMDD)

* Open the document in Firefox.

* Press CTRL-ALT-SHIFT-S.

* Select "Save as HMTL" from dialog box.

* Save the file as the base name in your new archive directory like
archives/20130320/getusermedia.html

* Copy all associated resources (images/)  into the newly created
archive directory.

* In the archive file, search for and edit the link for "This version"
  and fix to point at the new dated version of the spec

* Add the new archives/YYYYMMDD directory to git and make a commit.

* Create a new version tag:
  $ git tag -m "Editor's draft YYYYMMDD." vYYYYMMDD

* Push the commit and the new tag to the git repo:
  $ git push --tags origin master

* Once everyone is happy, the files need to be copied to the cvs repository.
Start by updating your copy (use -d option to get new directories):
  $ cvs update -d

* Confirm that you have all recent archive directories.  If any are
  missing, to be safe re-checkout your entire cvs directory from scratch to
  ensure that you have everything.

* Copy the following from your git directory to the cvs editor/ directory
 - images/
 - archives/YYYYMMDD (the new archived directory created above)

* If you are releasing a webrtc draft, also copy the following files into the
  "sources" subdirectory on CVS for archival purposes:
 - webrtc.html, webrtc.js, and webrtc.css
  Also, within the CVS directory create a soft symbolic link from your new
  archive dated version:
  $ ln -s archives/20130320/webrtc.html .
  (if you can't do symlinks, just copy the file)

* If you are releasing a getusermedia draft, also copy the following files
   into the "sources" subdirectory on CVS for archival purposes:
 - getusermedia.html, getusermedia.js, and getusermedia.css
  Also, within the CVS directory create a soft symbolic link from your new
  archive dated version:
  $ ln -s archives/20130320/getusermedia.html .
  (if you can't do symlinks, just copy the file)

* Add the new archive directory (with content) to cvs:
  $ find archives/YYYYMMDD -type d | xargs cvs add
  $ find archives/YYYYMMDD -type f | grep -v CVS | xargs cvs add

* Confirm what will be committed:
  $ cvs -qn update

* Commit new directory and changed files (...):
  $ cvs commit -m "Added YYYYMMDD archived version." archives/YYYYMMDD/ ...

* Send an email to the corresponding lists to announce the new release
(proposed template below).


To Annouce a Version
--------------------

Email template (use it if you like):

Hi

A new dated version of the Editors' draft is available.

Dated version: http://dev.w3.org/2011/webrtc/editor/archives/<YYYYMMDD>/<docname>.html
Living document: http://dev.w3.org/2011/webrtc/editor/<docname>.html

Changes include:
* ...
* ...

Please review and provide feedback.

<your name> (for the editors)


See Work Flow
-------------

[![Stories in Ready](https://badge.waffle.io/fluffy/webrtc-w3c.png?label=ready&title=Ready)](http://waffle.io/fluffy/webrtc-w3c)

