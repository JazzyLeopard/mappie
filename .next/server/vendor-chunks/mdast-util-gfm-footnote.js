"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/mdast-util-gfm-footnote";
exports.ids = ["vendor-chunks/mdast-util-gfm-footnote"];
exports.modules = {

/***/ "(ssr)/./node_modules/mdast-util-gfm-footnote/lib/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/mdast-util-gfm-footnote/lib/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   gfmFootnoteFromMarkdown: () => (/* binding */ gfmFootnoteFromMarkdown),\n/* harmony export */   gfmFootnoteToMarkdown: () => (/* binding */ gfmFootnoteToMarkdown)\n/* harmony export */ });\n/* harmony import */ var micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-normalize-identifier */ \"(ssr)/./node_modules/micromark-util-normalize-identifier/dev/index.js\");\n/* harmony import */ var mdast_util_to_markdown_lib_util_association_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mdast-util-to-markdown/lib/util/association.js */ \"(ssr)/./node_modules/mdast-util-to-markdown/lib/util/association.js\");\n/* harmony import */ var mdast_util_to_markdown_lib_util_container_flow_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! mdast-util-to-markdown/lib/util/container-flow.js */ \"(ssr)/./node_modules/mdast-util-to-markdown/lib/util/container-flow.js\");\n/* harmony import */ var mdast_util_to_markdown_lib_util_indent_lines_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! mdast-util-to-markdown/lib/util/indent-lines.js */ \"(ssr)/./node_modules/mdast-util-to-markdown/lib/util/indent-lines.js\");\n/* harmony import */ var mdast_util_to_markdown_lib_util_safe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mdast-util-to-markdown/lib/util/safe.js */ \"(ssr)/./node_modules/mdast-util-to-markdown/lib/util/safe.js\");\n/* harmony import */ var mdast_util_to_markdown_lib_util_track_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mdast-util-to-markdown/lib/util/track.js */ \"(ssr)/./node_modules/mdast-util-to-markdown/lib/util/track.js\");\n/**\n * @typedef {import('mdast').FootnoteReference} FootnoteReference\n * @typedef {import('mdast').FootnoteDefinition} FootnoteDefinition\n * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext\n * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension\n * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle\n * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension\n * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle\n * @typedef {import('mdast-util-to-markdown').Map} Map\n */\n\n\n\n\n\n\n\n\nfootnoteReference.peek = footnoteReferencePeek\n\n// To do: next major: rename `context` -> `state`, `safeOptions` to `info`, use\n// utilities on `state`.\n\n/**\n * Create an extension for `mdast-util-from-markdown` to enable GFM footnotes\n * in markdown.\n *\n * @returns {FromMarkdownExtension}\n *   Extension for `mdast-util-from-markdown`.\n */\nfunction gfmFootnoteFromMarkdown() {\n  return {\n    enter: {\n      gfmFootnoteDefinition: enterFootnoteDefinition,\n      gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,\n      gfmFootnoteCall: enterFootnoteCall,\n      gfmFootnoteCallString: enterFootnoteCallString\n    },\n    exit: {\n      gfmFootnoteDefinition: exitFootnoteDefinition,\n      gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,\n      gfmFootnoteCall: exitFootnoteCall,\n      gfmFootnoteCallString: exitFootnoteCallString\n    }\n  }\n}\n\n/**\n * Create an extension for `mdast-util-to-markdown` to enable GFM footnotes\n * in markdown.\n *\n * @returns {ToMarkdownExtension}\n *   Extension for `mdast-util-to-markdown`.\n */\nfunction gfmFootnoteToMarkdown() {\n  return {\n    // This is on by default already.\n    unsafe: [{character: '[', inConstruct: ['phrasing', 'label', 'reference']}],\n    handlers: {footnoteDefinition, footnoteReference}\n  }\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction enterFootnoteDefinition(token) {\n  this.enter(\n    {type: 'footnoteDefinition', identifier: '', label: '', children: []},\n    token\n  )\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction enterFootnoteDefinitionLabelString() {\n  this.buffer()\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction exitFootnoteDefinitionLabelString(token) {\n  const label = this.resume()\n  const node = /** @type {FootnoteDefinition} */ (\n    this.stack[this.stack.length - 1]\n  )\n  node.label = label\n  node.identifier = (0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_0__.normalizeIdentifier)(\n    this.sliceSerialize(token)\n  ).toLowerCase()\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction exitFootnoteDefinition(token) {\n  this.exit(token)\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction enterFootnoteCall(token) {\n  this.enter({type: 'footnoteReference', identifier: '', label: ''}, token)\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction enterFootnoteCallString() {\n  this.buffer()\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction exitFootnoteCallString(token) {\n  const label = this.resume()\n  const node = /** @type {FootnoteDefinition} */ (\n    this.stack[this.stack.length - 1]\n  )\n  node.label = label\n  node.identifier = (0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_0__.normalizeIdentifier)(\n    this.sliceSerialize(token)\n  ).toLowerCase()\n}\n\n/**\n * @this {CompileContext}\n * @type {FromMarkdownHandle}\n */\nfunction exitFootnoteCall(token) {\n  this.exit(token)\n}\n\n/**\n * @type {ToMarkdownHandle}\n * @param {FootnoteReference} node\n */\nfunction footnoteReference(node, _, context, safeOptions) {\n  const tracker = (0,mdast_util_to_markdown_lib_util_track_js__WEBPACK_IMPORTED_MODULE_1__.track)(safeOptions)\n  let value = tracker.move('[^')\n  const exit = context.enter('footnoteReference')\n  const subexit = context.enter('reference')\n  value += tracker.move(\n    (0,mdast_util_to_markdown_lib_util_safe_js__WEBPACK_IMPORTED_MODULE_2__.safe)(context, (0,mdast_util_to_markdown_lib_util_association_js__WEBPACK_IMPORTED_MODULE_3__.association)(node), {\n      ...tracker.current(),\n      before: value,\n      after: ']'\n    })\n  )\n  subexit()\n  exit()\n  value += tracker.move(']')\n  return value\n}\n\n/** @type {ToMarkdownHandle} */\nfunction footnoteReferencePeek() {\n  return '['\n}\n\n/**\n * @type {ToMarkdownHandle}\n * @param {FootnoteDefinition} node\n */\nfunction footnoteDefinition(node, _, context, safeOptions) {\n  const tracker = (0,mdast_util_to_markdown_lib_util_track_js__WEBPACK_IMPORTED_MODULE_1__.track)(safeOptions)\n  let value = tracker.move('[^')\n  const exit = context.enter('footnoteDefinition')\n  const subexit = context.enter('label')\n  value += tracker.move(\n    (0,mdast_util_to_markdown_lib_util_safe_js__WEBPACK_IMPORTED_MODULE_2__.safe)(context, (0,mdast_util_to_markdown_lib_util_association_js__WEBPACK_IMPORTED_MODULE_3__.association)(node), {\n      ...tracker.current(),\n      before: value,\n      after: ']'\n    })\n  )\n  subexit()\n  value += tracker.move(\n    ']:' + (node.children && node.children.length > 0 ? ' ' : '')\n  )\n  tracker.shift(4)\n  value += tracker.move(\n    (0,mdast_util_to_markdown_lib_util_indent_lines_js__WEBPACK_IMPORTED_MODULE_4__.indentLines)((0,mdast_util_to_markdown_lib_util_container_flow_js__WEBPACK_IMPORTED_MODULE_5__.containerFlow)(node, context, tracker.current()), map)\n  )\n  exit()\n\n  return value\n}\n\n/** @type {Map} */\nfunction map(line, index, blank) {\n  if (index === 0) {\n    return line\n  }\n\n  return (blank ? '' : '    ') + line\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0tZm9vdG5vdGUvbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQSxhQUFhLG1DQUFtQztBQUNoRCxhQUFhLG9DQUFvQztBQUNqRCxhQUFhLG1EQUFtRDtBQUNoRSxhQUFhLDhDQUE4QztBQUMzRCxhQUFhLDJDQUEyQztBQUN4RCxhQUFhLDBDQUEwQztBQUN2RCxhQUFhLHlDQUF5QztBQUN0RCxhQUFhLHNDQUFzQztBQUNuRDs7QUFFdUU7QUFDRztBQUNLO0FBQ0o7QUFDZjtBQUNFOztBQUU5RDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQSxjQUFjLGdFQUFnRTtBQUM5RSxlQUFlO0FBQ2Y7QUFDQTs7QUFFQTtBQUNBLFVBQVU7QUFDVixVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsS0FBSyxvRUFBb0U7QUFDekU7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBVTtBQUNWLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFVBQVU7QUFDVixVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLG9CQUFvQjtBQUM5QztBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isd0ZBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFVBQVU7QUFDVixVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFVO0FBQ1YsVUFBVTtBQUNWO0FBQ0E7QUFDQSxjQUFjLHFEQUFxRDtBQUNuRTs7QUFFQTtBQUNBLFVBQVU7QUFDVixVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFVO0FBQ1YsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixvQkFBb0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHdGQUFtQjtBQUN2QztBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFVO0FBQ1YsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBVTtBQUNWLFdBQVcsbUJBQW1CO0FBQzlCO0FBQ0E7QUFDQSxrQkFBa0IsK0VBQUs7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLDZFQUFJLFVBQVUsMkZBQVc7QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXLGtCQUFrQjtBQUM3QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFVO0FBQ1YsV0FBVyxvQkFBb0I7QUFDL0I7QUFDQTtBQUNBLGtCQUFrQiwrRUFBSztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksNkVBQUksVUFBVSwyRkFBVztBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLDRGQUFXLENBQUMsZ0dBQWE7QUFDN0I7QUFDQTs7QUFFQTtBQUNBOztBQUVBLFdBQVcsS0FBSztBQUNoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZGQvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0tZm9vdG5vdGUvbGliL2luZGV4LmpzP2YzMTYiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtZGFzdCcpLkZvb3Rub3RlUmVmZXJlbmNlfSBGb290bm90ZVJlZmVyZW5jZVxuICogQHR5cGVkZWYge2ltcG9ydCgnbWRhc3QnKS5Gb290bm90ZURlZmluaXRpb259IEZvb3Rub3RlRGVmaW5pdGlvblxuICogQHR5cGVkZWYge2ltcG9ydCgnbWRhc3QtdXRpbC1mcm9tLW1hcmtkb3duJykuQ29tcGlsZUNvbnRleHR9IENvbXBpbGVDb250ZXh0XG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtZGFzdC11dGlsLWZyb20tbWFya2Rvd24nKS5FeHRlbnNpb259IEZyb21NYXJrZG93bkV4dGVuc2lvblxuICogQHR5cGVkZWYge2ltcG9ydCgnbWRhc3QtdXRpbC1mcm9tLW1hcmtkb3duJykuSGFuZGxlfSBGcm9tTWFya2Rvd25IYW5kbGVcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ21kYXN0LXV0aWwtdG8tbWFya2Rvd24nKS5PcHRpb25zfSBUb01hcmtkb3duRXh0ZW5zaW9uXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtZGFzdC11dGlsLXRvLW1hcmtkb3duJykuSGFuZGxlfSBUb01hcmtkb3duSGFuZGxlXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtZGFzdC11dGlsLXRvLW1hcmtkb3duJykuTWFwfSBNYXBcbiAqL1xuXG5pbXBvcnQge25vcm1hbGl6ZUlkZW50aWZpZXJ9IGZyb20gJ21pY3JvbWFyay11dGlsLW5vcm1hbGl6ZS1pZGVudGlmaWVyJ1xuaW1wb3J0IHthc3NvY2lhdGlvbn0gZnJvbSAnbWRhc3QtdXRpbC10by1tYXJrZG93bi9saWIvdXRpbC9hc3NvY2lhdGlvbi5qcydcbmltcG9ydCB7Y29udGFpbmVyRmxvd30gZnJvbSAnbWRhc3QtdXRpbC10by1tYXJrZG93bi9saWIvdXRpbC9jb250YWluZXItZmxvdy5qcydcbmltcG9ydCB7aW5kZW50TGluZXN9IGZyb20gJ21kYXN0LXV0aWwtdG8tbWFya2Rvd24vbGliL3V0aWwvaW5kZW50LWxpbmVzLmpzJ1xuaW1wb3J0IHtzYWZlfSBmcm9tICdtZGFzdC11dGlsLXRvLW1hcmtkb3duL2xpYi91dGlsL3NhZmUuanMnXG5pbXBvcnQge3RyYWNrfSBmcm9tICdtZGFzdC11dGlsLXRvLW1hcmtkb3duL2xpYi91dGlsL3RyYWNrLmpzJ1xuXG5mb290bm90ZVJlZmVyZW5jZS5wZWVrID0gZm9vdG5vdGVSZWZlcmVuY2VQZWVrXG5cbi8vIFRvIGRvOiBuZXh0IG1ham9yOiByZW5hbWUgYGNvbnRleHRgIC0+IGBzdGF0ZWAsIGBzYWZlT3B0aW9uc2AgdG8gYGluZm9gLCB1c2Vcbi8vIHV0aWxpdGllcyBvbiBgc3RhdGVgLlxuXG4vKipcbiAqIENyZWF0ZSBhbiBleHRlbnNpb24gZm9yIGBtZGFzdC11dGlsLWZyb20tbWFya2Rvd25gIHRvIGVuYWJsZSBHRk0gZm9vdG5vdGVzXG4gKiBpbiBtYXJrZG93bi5cbiAqXG4gKiBAcmV0dXJucyB7RnJvbU1hcmtkb3duRXh0ZW5zaW9ufVxuICogICBFeHRlbnNpb24gZm9yIGBtZGFzdC11dGlsLWZyb20tbWFya2Rvd25gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2ZtRm9vdG5vdGVGcm9tTWFya2Rvd24oKSB7XG4gIHJldHVybiB7XG4gICAgZW50ZXI6IHtcbiAgICAgIGdmbUZvb3Rub3RlRGVmaW5pdGlvbjogZW50ZXJGb290bm90ZURlZmluaXRpb24sXG4gICAgICBnZm1Gb290bm90ZURlZmluaXRpb25MYWJlbFN0cmluZzogZW50ZXJGb290bm90ZURlZmluaXRpb25MYWJlbFN0cmluZyxcbiAgICAgIGdmbUZvb3Rub3RlQ2FsbDogZW50ZXJGb290bm90ZUNhbGwsXG4gICAgICBnZm1Gb290bm90ZUNhbGxTdHJpbmc6IGVudGVyRm9vdG5vdGVDYWxsU3RyaW5nXG4gICAgfSxcbiAgICBleGl0OiB7XG4gICAgICBnZm1Gb290bm90ZURlZmluaXRpb246IGV4aXRGb290bm90ZURlZmluaXRpb24sXG4gICAgICBnZm1Gb290bm90ZURlZmluaXRpb25MYWJlbFN0cmluZzogZXhpdEZvb3Rub3RlRGVmaW5pdGlvbkxhYmVsU3RyaW5nLFxuICAgICAgZ2ZtRm9vdG5vdGVDYWxsOiBleGl0Rm9vdG5vdGVDYWxsLFxuICAgICAgZ2ZtRm9vdG5vdGVDYWxsU3RyaW5nOiBleGl0Rm9vdG5vdGVDYWxsU3RyaW5nXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGV4dGVuc2lvbiBmb3IgYG1kYXN0LXV0aWwtdG8tbWFya2Rvd25gIHRvIGVuYWJsZSBHRk0gZm9vdG5vdGVzXG4gKiBpbiBtYXJrZG93bi5cbiAqXG4gKiBAcmV0dXJucyB7VG9NYXJrZG93bkV4dGVuc2lvbn1cbiAqICAgRXh0ZW5zaW9uIGZvciBgbWRhc3QtdXRpbC10by1tYXJrZG93bmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZm1Gb290bm90ZVRvTWFya2Rvd24oKSB7XG4gIHJldHVybiB7XG4gICAgLy8gVGhpcyBpcyBvbiBieSBkZWZhdWx0IGFscmVhZHkuXG4gICAgdW5zYWZlOiBbe2NoYXJhY3RlcjogJ1snLCBpbkNvbnN0cnVjdDogWydwaHJhc2luZycsICdsYWJlbCcsICdyZWZlcmVuY2UnXX1dLFxuICAgIGhhbmRsZXJzOiB7Zm9vdG5vdGVEZWZpbml0aW9uLCBmb290bm90ZVJlZmVyZW5jZX1cbiAgfVxufVxuXG4vKipcbiAqIEB0aGlzIHtDb21waWxlQ29udGV4dH1cbiAqIEB0eXBlIHtGcm9tTWFya2Rvd25IYW5kbGV9XG4gKi9cbmZ1bmN0aW9uIGVudGVyRm9vdG5vdGVEZWZpbml0aW9uKHRva2VuKSB7XG4gIHRoaXMuZW50ZXIoXG4gICAge3R5cGU6ICdmb290bm90ZURlZmluaXRpb24nLCBpZGVudGlmaWVyOiAnJywgbGFiZWw6ICcnLCBjaGlsZHJlbjogW119LFxuICAgIHRva2VuXG4gIClcbn1cblxuLyoqXG4gKiBAdGhpcyB7Q29tcGlsZUNvbnRleHR9XG4gKiBAdHlwZSB7RnJvbU1hcmtkb3duSGFuZGxlfVxuICovXG5mdW5jdGlvbiBlbnRlckZvb3Rub3RlRGVmaW5pdGlvbkxhYmVsU3RyaW5nKCkge1xuICB0aGlzLmJ1ZmZlcigpXG59XG5cbi8qKlxuICogQHRoaXMge0NvbXBpbGVDb250ZXh0fVxuICogQHR5cGUge0Zyb21NYXJrZG93bkhhbmRsZX1cbiAqL1xuZnVuY3Rpb24gZXhpdEZvb3Rub3RlRGVmaW5pdGlvbkxhYmVsU3RyaW5nKHRva2VuKSB7XG4gIGNvbnN0IGxhYmVsID0gdGhpcy5yZXN1bWUoKVxuICBjb25zdCBub2RlID0gLyoqIEB0eXBlIHtGb290bm90ZURlZmluaXRpb259ICovIChcbiAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV1cbiAgKVxuICBub2RlLmxhYmVsID0gbGFiZWxcbiAgbm9kZS5pZGVudGlmaWVyID0gbm9ybWFsaXplSWRlbnRpZmllcihcbiAgICB0aGlzLnNsaWNlU2VyaWFsaXplKHRva2VuKVxuICApLnRvTG93ZXJDYXNlKClcbn1cblxuLyoqXG4gKiBAdGhpcyB7Q29tcGlsZUNvbnRleHR9XG4gKiBAdHlwZSB7RnJvbU1hcmtkb3duSGFuZGxlfVxuICovXG5mdW5jdGlvbiBleGl0Rm9vdG5vdGVEZWZpbml0aW9uKHRva2VuKSB7XG4gIHRoaXMuZXhpdCh0b2tlbilcbn1cblxuLyoqXG4gKiBAdGhpcyB7Q29tcGlsZUNvbnRleHR9XG4gKiBAdHlwZSB7RnJvbU1hcmtkb3duSGFuZGxlfVxuICovXG5mdW5jdGlvbiBlbnRlckZvb3Rub3RlQ2FsbCh0b2tlbikge1xuICB0aGlzLmVudGVyKHt0eXBlOiAnZm9vdG5vdGVSZWZlcmVuY2UnLCBpZGVudGlmaWVyOiAnJywgbGFiZWw6ICcnfSwgdG9rZW4pXG59XG5cbi8qKlxuICogQHRoaXMge0NvbXBpbGVDb250ZXh0fVxuICogQHR5cGUge0Zyb21NYXJrZG93bkhhbmRsZX1cbiAqL1xuZnVuY3Rpb24gZW50ZXJGb290bm90ZUNhbGxTdHJpbmcoKSB7XG4gIHRoaXMuYnVmZmVyKClcbn1cblxuLyoqXG4gKiBAdGhpcyB7Q29tcGlsZUNvbnRleHR9XG4gKiBAdHlwZSB7RnJvbU1hcmtkb3duSGFuZGxlfVxuICovXG5mdW5jdGlvbiBleGl0Rm9vdG5vdGVDYWxsU3RyaW5nKHRva2VuKSB7XG4gIGNvbnN0IGxhYmVsID0gdGhpcy5yZXN1bWUoKVxuICBjb25zdCBub2RlID0gLyoqIEB0eXBlIHtGb290bm90ZURlZmluaXRpb259ICovIChcbiAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV1cbiAgKVxuICBub2RlLmxhYmVsID0gbGFiZWxcbiAgbm9kZS5pZGVudGlmaWVyID0gbm9ybWFsaXplSWRlbnRpZmllcihcbiAgICB0aGlzLnNsaWNlU2VyaWFsaXplKHRva2VuKVxuICApLnRvTG93ZXJDYXNlKClcbn1cblxuLyoqXG4gKiBAdGhpcyB7Q29tcGlsZUNvbnRleHR9XG4gKiBAdHlwZSB7RnJvbU1hcmtkb3duSGFuZGxlfVxuICovXG5mdW5jdGlvbiBleGl0Rm9vdG5vdGVDYWxsKHRva2VuKSB7XG4gIHRoaXMuZXhpdCh0b2tlbilcbn1cblxuLyoqXG4gKiBAdHlwZSB7VG9NYXJrZG93bkhhbmRsZX1cbiAqIEBwYXJhbSB7Rm9vdG5vdGVSZWZlcmVuY2V9IG5vZGVcbiAqL1xuZnVuY3Rpb24gZm9vdG5vdGVSZWZlcmVuY2Uobm9kZSwgXywgY29udGV4dCwgc2FmZU9wdGlvbnMpIHtcbiAgY29uc3QgdHJhY2tlciA9IHRyYWNrKHNhZmVPcHRpb25zKVxuICBsZXQgdmFsdWUgPSB0cmFja2VyLm1vdmUoJ1teJylcbiAgY29uc3QgZXhpdCA9IGNvbnRleHQuZW50ZXIoJ2Zvb3Rub3RlUmVmZXJlbmNlJylcbiAgY29uc3Qgc3ViZXhpdCA9IGNvbnRleHQuZW50ZXIoJ3JlZmVyZW5jZScpXG4gIHZhbHVlICs9IHRyYWNrZXIubW92ZShcbiAgICBzYWZlKGNvbnRleHQsIGFzc29jaWF0aW9uKG5vZGUpLCB7XG4gICAgICAuLi50cmFja2VyLmN1cnJlbnQoKSxcbiAgICAgIGJlZm9yZTogdmFsdWUsXG4gICAgICBhZnRlcjogJ10nXG4gICAgfSlcbiAgKVxuICBzdWJleGl0KClcbiAgZXhpdCgpXG4gIHZhbHVlICs9IHRyYWNrZXIubW92ZSgnXScpXG4gIHJldHVybiB2YWx1ZVxufVxuXG4vKiogQHR5cGUge1RvTWFya2Rvd25IYW5kbGV9ICovXG5mdW5jdGlvbiBmb290bm90ZVJlZmVyZW5jZVBlZWsoKSB7XG4gIHJldHVybiAnWydcbn1cblxuLyoqXG4gKiBAdHlwZSB7VG9NYXJrZG93bkhhbmRsZX1cbiAqIEBwYXJhbSB7Rm9vdG5vdGVEZWZpbml0aW9ufSBub2RlXG4gKi9cbmZ1bmN0aW9uIGZvb3Rub3RlRGVmaW5pdGlvbihub2RlLCBfLCBjb250ZXh0LCBzYWZlT3B0aW9ucykge1xuICBjb25zdCB0cmFja2VyID0gdHJhY2soc2FmZU9wdGlvbnMpXG4gIGxldCB2YWx1ZSA9IHRyYWNrZXIubW92ZSgnW14nKVxuICBjb25zdCBleGl0ID0gY29udGV4dC5lbnRlcignZm9vdG5vdGVEZWZpbml0aW9uJylcbiAgY29uc3Qgc3ViZXhpdCA9IGNvbnRleHQuZW50ZXIoJ2xhYmVsJylcbiAgdmFsdWUgKz0gdHJhY2tlci5tb3ZlKFxuICAgIHNhZmUoY29udGV4dCwgYXNzb2NpYXRpb24obm9kZSksIHtcbiAgICAgIC4uLnRyYWNrZXIuY3VycmVudCgpLFxuICAgICAgYmVmb3JlOiB2YWx1ZSxcbiAgICAgIGFmdGVyOiAnXSdcbiAgICB9KVxuICApXG4gIHN1YmV4aXQoKVxuICB2YWx1ZSArPSB0cmFja2VyLm1vdmUoXG4gICAgJ106JyArIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCA/ICcgJyA6ICcnKVxuICApXG4gIHRyYWNrZXIuc2hpZnQoNClcbiAgdmFsdWUgKz0gdHJhY2tlci5tb3ZlKFxuICAgIGluZGVudExpbmVzKGNvbnRhaW5lckZsb3cobm9kZSwgY29udGV4dCwgdHJhY2tlci5jdXJyZW50KCkpLCBtYXApXG4gIClcbiAgZXhpdCgpXG5cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8qKiBAdHlwZSB7TWFwfSAqL1xuZnVuY3Rpb24gbWFwKGxpbmUsIGluZGV4LCBibGFuaykge1xuICBpZiAoaW5kZXggPT09IDApIHtcbiAgICByZXR1cm4gbGluZVxuICB9XG5cbiAgcmV0dXJuIChibGFuayA/ICcnIDogJyAgICAnKSArIGxpbmVcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-gfm-footnote/lib/index.js\n");

/***/ })

};
;