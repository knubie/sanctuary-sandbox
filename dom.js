const R = require('ramda');
const Sanctuary = require('sanctuary');
const $ = require('sanctuary-def');

//=============================
// Type definitions
//=============================

// Tokens :: Array String
const Tokens = $.NullaryType(
  'html-parser/Tokens',
  x => $.test([], $.Array($.String), x)
);

// Nodes :: [Node]
const Nodes = $.NullaryType(
  'html-parser/Nodes',
  x => $.test([], $.Array(Node), x)
);

// HTMLNode :: name: String, attr: Attributes, children: Nodes
const HTMLNode = $.RecordType({name: $.String,
                               attr: $.Object,
                           children: Nodes});

// TextNode :: String
const TextNode = $.NullaryType(
  'html-parser/TextNode',
  x => $.test([], $.String, x)
);

// Node :: HTMLNode | TextNode
const Node = $.NullaryType(
  'html-parser/Node',
  x => $.test([], HTMLNode, x) || $.test([], TextNode, x)
);

//  $Maybe :: Type -> Type
var Maybe = $.UnaryType(
  'sanctuary/Maybe',
  function(x) { return x != null && x['@@type'] === 'sanctuary/Maybe'; },
  function(maybe) { return maybe.isJust ? [maybe.value] : []; }
);

const env = $.env.concat([Tokens, Nodes, HTMLNode, TextNode, Node, Maybe]);
const def = $.create({checkTypes: true, env});
const S = Sanctuary.create({checkTypes: true, env: Sanctuary.env});


// ============================
// Actual Code
// ============================

const string = "<html><body class='body-class'><div id='header'><p>Hello, world!<test></test></p><p>Welcome</p></div></body></html>"
const tokenRE = /(<\/?[a-z]+[^>]*>|[^<]+)/

// tokenizer :: String -> Tokens
const tokenize = R.compose(R.filter(S.I), R.split(tokenRE));

// getNameOfFirstElement :: String -> Maybe String
const getNameOfFirstElement = R.compose(
  R.unnest,
  R.chain(S.last),
  R.chain(S.match(/<\/?([a-z]+)[^>]*>/)),
  S.head
)

// createCloseTag :: String -> Maybe String
const createCloseTag = el => S.Just(`</${el}>`);

// children :: Tokens -> Maybe Tokens
const children = def('children', {}, [Tokens, Maybe(Tokens)], (tokens) => {
  return R.composeK(
    R.ifElse(R.isEmpty, S.Nothing, S.Just),
    S.tail,
    S.take(R.__, tokens),
    S.indexOf(R.__, tokens),
    createCloseTag,
    getNameOfFirstElement
  )(S.Just(tokens))
});

// siblings :: Tokens -> Maybe Tokens
const siblings = def('siblings', {}, [Tokens, Maybe(Tokens)], (tokens) => {
  // Should be able to use R.composeK here, but I can't figure out how to
  // "unchain" S.or
  return R.compose(
    R.chain(R.ifElse(R.isEmpty, S.Nothing, S.Just)),
    R.chain(S.tail),
    R.chain(S.drop(R.__, tokens)),
    // If the first token is not an opening element tag, but instead
    // some inner text, use 1 as the drop index instead of the closing tag
    // (since there is no closing tag)
    S.or(R.__, S.Just(1)),
    R.chain(S.indexOf(R.__, tokens)),
    R.chain(createCloseTag),
    R.chain(getNameOfFirstElement)
  )(S.Just(tokens))
});

// tree :: Tokens -> Nodes
const tree = def('tree', {}, [Tokens, Nodes], (tokens) => {
  var element = getNameOfFirstElement(tokens);
  var node;
  if (element.isNothing) {
    node = S.head(tokens).value;
  } else {
    node = {
      name: element.value,
      attr: {},
      children: S.maybe([], tree, children(tokens))
    };
  }

  return R.filter(R.identity,
    [node, R.head(S.maybe([], tree, siblings(tokens)))]
  );
});

const tokens = tokenize(string);
console.log(JSON.stringify(tree(tokens)));
