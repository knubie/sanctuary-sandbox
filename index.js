const R = require('ramda');
const Sanctuary = require('sanctuary');
const $ = require('sanctuary-def');

const Card = $.RecordType({name: $.String, cost: $.Integer});
const Player = $.RecordType({hand: $.Array(Card), cash: $.Integer});

const env = $.env.concat([Card, Player]);
const def = $.create({checkTypes: true, env});

const S = Sanctuary.create({checkTypes: true, env: Sanctuary.env});

const playCard = def('playCard', {}, [$.Integer, Player, Player],
(index, player) => {
  return R.evolve({
    cash: R.flip(R.subtract)(player.hand[index].cost)
  }, player);
});

[{name: 'html', id: 'foo', class: 'ni'},
  ['div',
    ['p', 'para1'],
    ['p', 'para2']
  ]
]

var p = {
  hand: [{
    name: 'Pot of Greed',
    cost: 2
  }],
  cash: 10
};
pp = playCard(0, p);
//console.log(pp.cash);

const string = "<html><body class='body-class'><div id='header'><p>Hello, world!</p><p>Welcome</p></div></body></html>"
const tokenRE = /(<\/?[a-z]+[^>]*>|[^<]+)/
const tokenizer = R.compose(R.filter(S.I), R.split(tokenRE));
const tokens = tokenizer(string);

const tree = function(list) {
  if (list.length < 1) { return null }
  //var elType = R.match(/<\/?([a-z]+)[^>]*>/, S.head(list))[1]
  var elType = S.head(S.match(/<\/?([a-z]+)[^>]*>/, S.head(list)))
  if (!elType) {
    return list[0];
  }
  var closeIndex = R.indexOf(`</${elType}>`, list);
  var children = R.tail(R.take(closeIndex, list));
  var siblings = R.tail(R.drop(closeIndex, list));

  return R.filter(S.I, [[S.head(list), tree(children)], tree(siblings)]);
}

console.log("%j", tree(tokens));
//console.log(tokens);
