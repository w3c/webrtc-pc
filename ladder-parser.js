'use strict';
/*
 * Parse the Ladder diagram input. This syntax is largely compatible with
 * WSD (aspirationally, it will parse anything that WSD would parse
 * in mid-2012).
 *
 * Current syntax:
 *
 * 'title' <title>
 * 'participant' <participant-name> 'as' <participant-handle>
 * <participant-handle> [->|<->] <participant-handle> ':' <message>  [ <options> ]
 * 'advance' <number>
 * 'set' <variable> <value>
 * <options> ::= '[' <option> [ '=' <value>], ... ']' ]
 *
 */
var debug = require('./debug');
var Ladder = require('./ladder-diagram');

// Maybe something cooler than regexps would be cool here.
// I miss yacc.
var title_re = '^title\\s+(.*)';
var identifier_re = '[A-Za-z0-9_\\- \\(\\)@]+';
var words_re = '[^\\[\\]]+';
var timepoint_re = '(([A-Za-z0-9]+)\\s*:)?';
var options_re = '(.*)\\s*(\\[([^\\]]+)\\])$';
var participant_re = '^participant\\s+(' + words_re + ')\\s+as\\s+(' + identifier_re + ')';
var arrow_re = '^' + timepoint_re + '\\s*(' + identifier_re + ')\\s*(<?->)\\s*(' + identifier_re + ')\\s*:\\s*(' + words_re + ')';
var advance_re = '^advance\\s+(\\d+)';
var set_re = '^set\\s+([A-Za-z0-9\\-_]+)\\s+(\\S.*)';
var handlers = {};

var parse_participant = function(json, m, o) {
        json.participants.push([m[2].trim(), m[1].trim()]);
    };
handlers[participant_re] = parse_participant;

var parse_arrow = function(json, m, o) {

        var timepoint = m[2];
        var from = m[3].trim();
        var type = m[4] === "<->" ? Ladder.DARROW : Ladder.ARROW;
        var to = m[5].trim();
        var msg = m[6];

        var opt = o || {};
        // Canonicalize options
        if (opt.duration !== undefined) {
            opt.duration = parseInt(opt.duration, 10);
        }
        if (opt.advance !== undefined) {
            opt.advance = parseInt(opt.advance, 10);
        }

        debug("TIMEPOINT " + m[2]);
        if (m[2]) {
            opt.timepoint = m[2];
        }

        json.data.push([type, from, to, msg, opt]);
    };
handlers[arrow_re] = parse_arrow;

var parse_advance = function(json, m, o) {
        var advance;

        advance = parseInt(m[1], 10);
        if (isNaN(advance)) {
            debug.die("Couldn't parse advance " + m[0]);
        }
        json.data.push([Ladder.ADVANCE, 2]);
    };
handlers[advance_re] = parse_advance;

var parse_title = function(json, m, o) {
        if (json.title) {
            debug.die("Title already specified as: " + json.title);
        }

        json.title = m[1];
    };
handlers[title_re] = parse_title;

var parse_set = function(json, m, o) {
        json[m[1]] = m[2].trim();
    };
handlers[set_re] = parse_set;

var parse_options = function(opts) {
        // Options are a sequence of comma-separated values, with optional
        // assignment, i.e., a, b=c, d=f
        var lst = opts.split(',');
        var retval = {};

        lst.forEach(function(opt) {
            var m = opt.match('^\\s*(\\w+)\\s*(=\\s*(\\w+))?\\s*$');
            if (!m) {
                debug.die("Invalid option: " + opt);
            }
            retval[m[1]] = m[3] || true;
        });

        return retval;
    };

var parse = function(input) {
        var json = {
            participants: [],
            data: []
        };

        var m;
        var opt = null;
        var l;
        var l_orig;
        var line_ct = 0;
        var match = false;

        debug(input);
        input = input.split(/(?:\r\n?|\n)/);
        debug(input);

        while (true) {
            l = input.shift();
            debug(l);
            if (l === undefined) {
                break;
            }

            if (l.match('^\\s*$') || l.match('#.*')) { // Blank line or Comment
                continue;
            }

            line_ct++;
            l_orig = l;

            opt = {};

            // First pull the options off
            m = l.match(options_re);
            if (m) {
                // There are options
                l = m[1];
                opt = parse_options(m[3]);
            }
            opt.line_ct__ = line_ct;

            // Now we can parse the start of the line as expected
            match = false;
            for (var r in handlers) {
                if (handlers.hasOwnProperty(r)) {
                    debug(r);
                    m = l.match(r);
                    if (m) {
                        handlers[r](json, m, opt);
                        match = true;
                        break;
                    }
                }
            }
            if (!match) {
                debug.die("No match at line " + line_ct + ' :' + l_orig);
            }
        }
        debug("Parsed: " + JSON.stringify(json));
        return json;
    };

module.exports = {
    parse: parse
};