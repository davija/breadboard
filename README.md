[![Build Status](https://travis-ci.org/atsid/breadboard.svg?branch=master)](https://travis-ci.org/atsid/breadboard)

Breadboard uses JSON Schema to define object models and the possible links associated with them, and then auto-generates MongoDB persistence code and Express RESTful service code in node.js.
It uses RQL to allow very simple query matchers to determine if a given link should be present on a response object, hence expressing all application state via the responses.
