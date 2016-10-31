import Text.Regex.Posix

type Tokens = [String]

data Node = TextNode String
          | HTMLNode { name     :: String
                     , attr     :: [String]
                     , children :: [Node] }
                     deriving (Show)

tokenRE = "(<\\/?[a-z]+[^>]*>|[^<]+)"

htmlString = "<html><body class='body-class'><div id='header'><p>Hello, world!<test></test></p><p>Welcome</p></div></body></html>"

tokenize :: String -> Tokens
tokenize string = getAllTextMatches (string =~ tokenRE :: AllTextMatches [] String)

-- main = putStrLn "Hello, World!"
