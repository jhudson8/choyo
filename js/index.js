global.resourcePublicPath = global.resourcePublicPath || 'https://dl.dropboxusercontent.com/u/6589453/book/app/';
__webpack_public_path__ = global.resourcePublicPath;

var React = require('react');
var Backbone = require('backbone');
var _ = require('underscore');
var Context = require('./context');
require('../styles/style.css');

var context;
var book;

function checkForBook() {
  if (!window.book) {
    setTimeout(checkForBook, 1000);
  } else {
    book = window.book(React);
    init();
  }
}
checkForBook();

function init() {
  document.body.innerHTML = '<div id="book" class="book"></div>';

  function startBook() {
    Context.clear();
    context = new Context();
    var CoverPage = require('./cover-page');

    function onClick() {
      if (book.setup) {
        book.setup.call(context);
      }
      context.save();
      navigate('page/main', true);
    }
    React.render(<CoverPage book={book} onClick={onClick}/>, document.getElementById('book'));
  }

  function currentPage() {
    if (!context) {
      context = Context.restore();
      if (!context || !context._pageId) {
        return navigate('book', true);
      }
    }
    navigate('page/' + context._pageId, {replace: true, trigger: true});
  }

  function showPage(pageId) {
    if (!context) {
      context = Context.restore();
      if (!context) {
        return navigate('book', true);
      }
    }

    var Page = require('./page');
    var handler = book.pages[pageId];
    if (!handler) {
      handler = {
        content: function() {
          return <div>
            FIX ME: The page <b>{pageId}</b> does not exist.
          </div>
        }
      }
    }
    context._pageId = pageId;

    if (handler.vars) {
      _.each(handler.vars, function(value, key) {
        context[key] = value;
      });
    }

    context.save();
    var _spacer = {
      content: function() {
        return <div></div>;
      }
    }
    React.render(<Page handler={_spacer} context={context} navigator={navigate}/>, document.getElementById('book'));
    setTimeout(function() {
      React.render(<Page id={pageId} handler={handler} context={context} navigator={navigate}/>, document.getElementById('book'));
    }, 400);
  }

  function navigate(route, options) {
    options = options || true;
    if (options === true) {
      options = {trigger: true, replace: false};
    }
    _options = _.clone(options);
    _options.trigger = false;
    Backbone.history.navigate(route, _options);
    if (options.trigger) {
      Backbone.history.loadUrl(route);
    }
  }


  var Router = Backbone.Router.extend({
    routes: {
      'page/:pageId': showPage,
      'book': startBook,
      '': currentPage
    }
  });
  new Router();
  Backbone.history.start();
}
