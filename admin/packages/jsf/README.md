## What

## Why

出于更好实现数据校验、表单联动的考虑，不再使用标准 JSON Schema 规范，因为没有序列化成 JSON 的需求，所以基于标准重新定义了一套 DSL（domain specific language） Schema，支持定义在 js 文件内而非 json 文件，能支持非序列化数据，例如：Function , undefined , RegExp 等。

## How
