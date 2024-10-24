# @qgustavor/later


This project is a ES Modules fork of Later. Later is a library for describing recurring schedules and calculating their future occurrences.  It supports a very flexible schedule definition including support for composite schedules and schedule exceptions. Create new schedules manually, via Cron expression, via natural language expressions, or using a fully chainable API.

This fork also removed benchmarks, tests and all the other fuss I don't plan to maintain.

## Table of Contents

* [Features](#features)
* [Documentation](#documentation)
* [Install](#install)
* [Usage](#usage)
  * [Node](#node)
  * [Browser](#browser)
* [Contributors](#contributors)
* [License](#license)

## Features

Types of schedules supported by *Later*:

* Run a report on the last day of every month at 12 AM except in December
* Install patches on the 2nd Tuesday of every month at 4 AM
* Gather CPU metrics every 10 mins Mon - Fri and every 30 mins Sat - Sun
* Send out a scary e-mail at 13:13:13 every Friday the 13th

## Documentation

WIP. In the meanwhile see [parent fork's documentation](https://breejs.github.io/later/).

## Install

```sh
npm install @qgustavor/later
```

## Usage

### Node.js

```js
import * as later from '@qgustavor/later'

console.log(later)
```

### Browser

#### Vanilla JS

This is the solution for you if you're just using `<script>` tags everywhere!

```html
<script type="module">
import * as later from 'https://unpkg.com/@qgustavor/later'
</script>
```

#### Bundler

Assuming you are still using a bundler, you can simply follow Node.js usage above.

## License

[MIT](LICENSE) © BunKat
