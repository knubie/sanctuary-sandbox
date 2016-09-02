const R = require('ramda');
const Sanctuary = require('sanctuary');
const $ = require('sanctuary-def');

const env = $.env;
const def = $.create({checkTypes: true, env});

const S = Sanctuary.create({checkTypes: true, env: Sanctuary.env});

const string = "<html><body class='body-class'><div id='header'><p>Hello, world!</p><p>Welcome</p></div></body></html>"
const tokenRE = /(<\/?[a-z]+[^>]*>|[^<]+)/
const tokenizer = R.compose(R.filter(S.I), R.split(tokenRE));
const tokens = tokenizer(string);

// tree :: [String] -> Maybe Tree
const tree = function(list) {
  if (S.isNothing(list)) { return S.Nothing() }

  var getElType = R.compose(
    R.chain,
    S.last,
    R.match(/<\/?([a-z]+)[^>]*>/),
    R.chain,
    S.head
  );
  var elType = R.chain(
    S.last,
    R.map(
      R.match(/<\/?([a-z]+)[^>]*>/),
      R.chain(
        S.head,
        list
      )
    )
  );
  var elType = list.chain(S.head).map(R.match(/<\/?([a-z]+)[^>]*>/)).chain(S.last);
  console.log(elType);

  if (elType.isNothing) {
    return list.chain(S.head);
  }
  var closeTag = S.Just("</").concat(elType).concat(S.Just(">"));
  console.log(closeTag);
  closeTag.chain(S.indexOf)
  var closeIndex = list.chain(S.indexOf(closeTag));
  //var closeIndex = R.indexOf(`</${elType}>`, list);
  console.log(closeIndex);
  var children = S.tail(R.take(closeIndex, list));
  console.log(children);
  var siblings = S.tail(R.drop(closeIndex, list));
  console.log(siblings);

  //return S.Maybe.of(R.reject(S.isNothing, [[S.head(list), tree(children)], tree(siblings)]));
}

console.log("%j", tree(S.Just(tokens)));
//console.log("%j", tree(S.Just(['foo'])));
//var foo = S.Just(tokens).chain(S.head);
//console.log(foo);
//console.log(R.reject(S.isNothing, [S.Nothing(), S.Maybe.of("foo"), S.Maybe.of("bar"), S.Nothing()]));
//console.log(tokens);
