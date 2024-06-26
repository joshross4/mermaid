/* Lexical grammar */
%lex

%%
\s+                   /* skip whitespace */
"venn"                return 'VENN'
"title"               return 'TITLE'
"set"                 return 'SET'
"intersect"           return 'INTERSECT'
"style"               return 'STYLE'
"size"                return 'SIZE'
":"                   return ':'
","                   return ','
[0-9]+("."[0-9]+)?    return 'NUMBER'
[a-zA-Z][a-zA-Z0-9_]* return 'IDENTIFIER'
"#"[0-9a-fA-F]{6}     return 'COLOR'
[^\n\r]+              return 'TEXT'
<<EOF>>               return 'EOF'

/lex

/* Operator associations and precedence */

%start start

%% /* language grammar */

start
    : VENN statements EOF
        { return $2; }
    ;

statements
    : statement
        { $$ = [$1]; }
    | statements statement
        { $$ = $1.concat($2); }
    ;

statement
    : title_statement
    | set_statement
    | intersect_statement
    | style_statement
    ;

title_statement
    : TITLE TEXT
        { $$ = {type: 'title', text: $2}; }
    ;

set_statement
    : SET IDENTIFIER size_opt
        { $$ = {type: 'set', id: $2, size: $3}; }
    ;

intersect_statement
    : INTERSECT identifier_list ':' TEXT size_opt
        { $$ = {type: 'intersect', sets: $2, label: $4, size: $5}; }
    | INTERSECT identifier_list size_opt
        { $$ = {type: 'intersect', sets: $2, size: $3}; }
    ;

style_statement
    : STYLE IDENTIFIER style_attributes
        { $$ = {type: 'style', id: $2, attributes: $3}; }
    ;

size_opt
    : /* empty */
        { $$ = null; }
    | SIZE ':' NUMBER
        { $$ = Number($3); }
    ;

identifier_list
    : IDENTIFIER
        { $$ = [$1]; }
    | identifier_list IDENTIFIER
        { $$ = $1.concat($2); }
    ;

style_attributes
    : style_attribute
        { $$ = [$1]; }
    | style_attributes ',' style_attribute
        { $$ = $1.concat($3); }
    ;

style_attribute
    : IDENTIFIER ':' style_value
        { $$ = {key: $1, value: $3}; }
    ;

style_value
    : NUMBER
        { $$ = Number($1); }
    | COLOR
        { $$ = $1; }
    | TEXT
        { $$ = $1; }
    ;
