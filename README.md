# log4js-node-nedb

> A log4js-node log appender to write logs into NeDB.

## Install

    $ npm install log4js-node-nedb

## Documentation

You can use this appender like all other log4js-node appenders. 
It just needs the filename-string to the nedb db.
Otherwise, you can use pre-initialized nedb database.
([NeDB doc](https://github.com/louischatriot/nedb/))
You can log a `string` or any kind of `object`. The objects are stored as they are and not converted to strings.

```js
var log4js = require('log4js');
var nedbAppender = require('log4js-node-nedb');

log4js.addAppender(
    nedbAppender.appender({filename: 'log.nedb'}),
    'cheese'
);

var logger = log4js.getLogger('cheese');
logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Gouda.');
logger.warn('Cheese is quite smelly.');
logger.error('Cheese is too ripe!');
logger.fatal('Cheese was breeding ground for listeria.');

// log objects
logger.info({id: 1, name: 'wayne'});
logger.info([1, 2, 3]);
```

Or you can use the configure method.

```js
var log4js = require('log4js'),
    nedb = require('nedb'),
    db = new nedb({ filename: 'path/to/datafile' });
    db.loadDatabase();

log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'log4js-node-nedb',
            database: db,
            category: 'cheese'
        }        
    ]
});
```

The log data is stored in the following format.

```js
{
    _id: ObjectID,
    timestamp: loggingEvent.startTime,
    data: loggingEvent.data,
    level: loggingEvent.level,
    category: loggingEvent.logger.category
}
```

Here some examples.

```js
var log4js = require('log4js'),
    nedbAppender = require('log4js-node-nedb');

log4js.addAppender(
    nedbAppender.appender({filename: 'log.nedb'}),
    'audit'
);

var logger = log4js.getLogger('audit');
logger.debug('Hello %s, your are the %d user logged in!', 'wayne', 10);

// saved as
{
    _id: new ObjectID(),
    timestamp: new Date(),
    data: 'Hello wayne, your are the 10 user logged in!',
    level: {
        level: 10000,
        levelStr: 'DEBUG'
    },
    category: 'audit'
}

logger.info({id: 1, name: 'wayne'});

// saved as
{
    _id: new ObjectID(),
    timestamp: new Date(),
    data: {
        id: 1,
        name: 'wayne'
    },
    level: {
        level: 20000,
        levelStr: 'INFO'
    },
    category: 'audit'
}
```

### Configuration
There are some options which can by set through the config object.

#### filename String
The filename-string to the nedb database.

* | *
--- | ---
Type | `string`
Required | `true`
Default value |

```js
var log4js = require('log4js'),
    nedbAppender = require('log4js-node-nedb');

log4js.addAppender(
    nedbAppender.appender({filename: 'log.nedb'}),
    'cheese'
);
```

#### database Object
The database-object to with pre-initialized NeDB database.

* | *
--- | ---
Type | `Object`
Required | `true`
Default value |

```js
var log4js = require('log4js'),
    nedbAppender = require('log4js-node-nedb'),
    nedb = require('nedb'),
    db = new nedb({ filename: 'path/to/datafile' });
    db.loadDatabase();

log4js.addAppender(
    nedbAppender.appender({database: db}),
    'cheese'
);
```

#### layout
The log4js-node layout which is used when logging a string. ([log4js-node layouts](https://github.com/nomiddlename/log4js-node/wiki/Layouts))

* | *
--- | ---
Type | `string`
Required | `false`
Default value | `'messagePassThroughLayout'`

```js
var log4js = require('log4js'),
    nedbAppender = require('log4js-node-nedb');

log4js.addAppender(
    nedbAppender.appender({
        filename: 'log.nedb',
        layout: 'colored'
    }),
    'cheese'
);
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

## Release History
### v0.0.1 project initial

## Author
[Ascard](https://github.com/Ascard/)

## License
Copyright (C) 2017 Ascard <lynx-me@yandex.ru>
Licensed under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
