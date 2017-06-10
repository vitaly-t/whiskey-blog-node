var TDW = (function (window, document) {

    'use strict';


    /* helper functions
     * ================
     */

    // cast to array, because _.toArray and _.castArray are inadequate when
    // the argument could be either a node or nodeList. Also doubles as
    // an array copier
    function toArray(collection) {
        var result = [];
        if (collection) {
            if (typeof collection.length === 'number') {
                for (var i = 0; i < collection.length; i++) {
                    result.push(collection[i]);
                }
            } else {
                result.push(collection);
            }
        }
        return result;
    }


    /* toggles
     * =======
     *
     * a one-to-many class toggler activated on click
     *
     * default elements:
     * <el data-toggle-target="[keyword|selector]" />
     */

    var toggles = (function () {
        var toggleList = [],

            togglePrototype = {
                origin: null,
                targets: [],
                activeClass: 'is-active',

                // make toggle go
                activate: function activate(force) {
                    _.forEach([this.origin].concat(this.targets), function (el) {
                        if (typeof force === 'boolean') {
                            el.classList.toggle(this.activeClass, force);
                        } else {
                            el.classList.toggle(this.activeClass);
                        }
                    }.bind(this));
                    if (typeof this.onActivate === 'function') {
                        this.onActivate(this);
                    }
                    return this;
                },

                // get targets and add event listeners
                init: function init() {
                    if (!this.targets || this.targets.length === 0) {
                        this.targets = findTargets(this.origin);
                    } else {
                        // make sure we've got an array of targets
                        this.targets = toArray(this.targets);
                    }
                    this.origin.addEventListener('click', function (ev) {
                        ev.preventDefault();
                        this.activate();
                    }.bind(this));
                    if (typeof this.onInit === 'function') {
                        this.onInit(this);
                    }
                    return this;
                },

                // optional callbacks
                onActivate: null,
                onInit: null
            };

        // private: parses a target string and returns a matching array
        function findTargets(el) {
            var targetString = el.getAttribute('data-toggle-target');
            if (!targetString) {
                return [];
            } else if (targetString === 'next') {
                return [el.nextElementSibling];
            } else if (targetString === 'parent') {
                return [el.parentNode];
            } else if (targetString === 'parentnext') {
                return [el.parentNode.nextElementSibling];
            } else if (targetString === 'parentparentnext') {
                return [el.parentNode.parentNode.nextElementSibling];
            }
            return toArray(document.querySelectorAll(targetString));
        }

        // public: make node or nodeList toggleable
        function add(els, options) {
            options = options || {};
            els = toArray(els);
            _.forEach(els, function (el) {
                var toggle = _.assign(Object.create(togglePrototype), { origin: el }, options);
                toggleList.push(toggle);
                toggle.init();
            });
            return list();
        }

        // public: returns an array of all toggles on the page
        function list() {
            return toggleList;
        }

        // public: returns all toggle objects whose origins match a given css selector
        function find(selector) {
            var result = [];
            _.forEach(list(), function (toggle) {
                if (toggle.origin.matches(selector)) {
                    result.push(toggle);
                }
            });
            return result;
        }

        // public: returns a single toggle object whose origin matches a given css selector
        function get(selector) {
            var result = null;
            _.forEach(list(), function (toggle) {
                if (toggle.origin.matches(selector)) {
                    result = toggle;
                    return false;
                }
            });
            return result;
        }

        // public: initialize by adding default elements
        function init() {
            add(document.querySelectorAll('[data-toggle-target]'));
        }

        return {
            add: add,
            list: list,
            find: find,
            get: get,
            init: init
        };
    }());


    //////////////////////
    //  initialization  //
    //////////////////////

    var init = function () {
        toggles.init();
        document.documentElement.classList.remove('no-js');
        document.documentElement.classList.add('js');
    };


    //////////////
    //  public  //
    //////////////

    return {
        toggles: toggles,
        init: init
    };

}(window, document));

TDW.init();
