"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/mdast-util-gfm";
exports.ids = ["vendor-chunks/mdast-util-gfm"];
exports.modules = {

/***/ "(ssr)/./node_modules/mdast-util-gfm/lib/index.js":
/*!**************************************************!*\
  !*** ./node_modules/mdast-util-gfm/lib/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   gfmFromMarkdown: () => (/* binding */ gfmFromMarkdown),\n/* harmony export */   gfmToMarkdown: () => (/* binding */ gfmToMarkdown)\n/* harmony export */ });\n/* harmony import */ var mdast_util_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-gfm-autolink-literal */ \"(ssr)/./node_modules/mdast-util-gfm-autolink-literal/lib/index.js\");\n/* harmony import */ var mdast_util_gfm_footnote__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mdast-util-gfm-footnote */ \"(ssr)/./node_modules/mdast-util-gfm-footnote/lib/index.js\");\n/* harmony import */ var mdast_util_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mdast-util-gfm-strikethrough */ \"(ssr)/./node_modules/mdast-util-gfm-strikethrough/lib/index.js\");\n/* harmony import */ var mdast_util_gfm_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mdast-util-gfm-table */ \"(ssr)/./node_modules/mdast-util-gfm-table/lib/index.js\");\n/* harmony import */ var mdast_util_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! mdast-util-gfm-task-list-item */ \"(ssr)/./node_modules/mdast-util-gfm-task-list-item/lib/index.js\");\n/**\n * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension\n * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension\n */\n\n/**\n * @typedef {import('mdast-util-gfm-table').Options} Options\n *   Configuration.\n */\n\n\n\n\n\n\n\n/**\n * Create an extension for `mdast-util-from-markdown` to enable GFM (autolink\n * literals, footnotes, strikethrough, tables, tasklists).\n *\n * @returns {Array<FromMarkdownExtension>}\n *   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,\n *   footnotes, strikethrough, tables, tasklists).\n */\nfunction gfmFromMarkdown() {\n  return [\n    mdast_util_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_0__.gfmAutolinkLiteralFromMarkdown,\n    (0,mdast_util_gfm_footnote__WEBPACK_IMPORTED_MODULE_1__.gfmFootnoteFromMarkdown)(),\n    mdast_util_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_2__.gfmStrikethroughFromMarkdown,\n    mdast_util_gfm_table__WEBPACK_IMPORTED_MODULE_3__.gfmTableFromMarkdown,\n    mdast_util_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_4__.gfmTaskListItemFromMarkdown\n  ]\n}\n\n/**\n * Create an extension for `mdast-util-to-markdown` to enable GFM (autolink\n * literals, footnotes, strikethrough, tables, tasklists).\n *\n * @param {Options | null | undefined} [options]\n *   Configuration.\n * @returns {ToMarkdownExtension}\n *   Extension for `mdast-util-to-markdown` to enable GFM (autolink literals,\n *   footnotes, strikethrough, tables, tasklists).\n */\nfunction gfmToMarkdown(options) {\n  return {\n    extensions: [\n      mdast_util_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_0__.gfmAutolinkLiteralToMarkdown,\n      (0,mdast_util_gfm_footnote__WEBPACK_IMPORTED_MODULE_1__.gfmFootnoteToMarkdown)(),\n      mdast_util_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_2__.gfmStrikethroughToMarkdown,\n      (0,mdast_util_gfm_table__WEBPACK_IMPORTED_MODULE_3__.gfmTableToMarkdown)(options),\n      mdast_util_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_4__.gfmTaskListItemToMarkdown\n    ]\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1nZm0vbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBLGFBQWEsOENBQThDO0FBQzNELGFBQWEsMENBQTBDO0FBQ3ZEOztBQUVBO0FBQ0EsYUFBYSx3Q0FBd0M7QUFDckQ7QUFDQTs7QUFLd0M7QUFJUjtBQUlLO0FBQ3dDO0FBSXZDOztBQUV0QztBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0EsSUFBSSwyRkFBOEI7QUFDbEMsSUFBSSxnRkFBdUI7QUFDM0IsSUFBSSxzRkFBNEI7QUFDaEMsSUFBSSxzRUFBb0I7QUFDeEIsSUFBSSxzRkFBMkI7QUFDL0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsNEJBQTRCO0FBQ3ZDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBLE1BQU0seUZBQTRCO0FBQ2xDLE1BQU0sOEVBQXFCO0FBQzNCLE1BQU0sb0ZBQTBCO0FBQ2hDLE1BQU0sd0VBQWtCO0FBQ3hCLE1BQU0sb0ZBQXlCO0FBQy9CO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2RkLy4vbm9kZV9tb2R1bGVzL21kYXN0LXV0aWwtZ2ZtL2xpYi9pbmRleC5qcz9hNzlkIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHR5cGVkZWYge2ltcG9ydCgnbWRhc3QtdXRpbC1mcm9tLW1hcmtkb3duJykuRXh0ZW5zaW9ufSBGcm9tTWFya2Rvd25FeHRlbnNpb25cbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ21kYXN0LXV0aWwtdG8tbWFya2Rvd24nKS5PcHRpb25zfSBUb01hcmtkb3duRXh0ZW5zaW9uXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtZGFzdC11dGlsLWdmbS10YWJsZScpLk9wdGlvbnN9IE9wdGlvbnNcbiAqICAgQ29uZmlndXJhdGlvbi5cbiAqL1xuXG5pbXBvcnQge1xuICBnZm1BdXRvbGlua0xpdGVyYWxGcm9tTWFya2Rvd24sXG4gIGdmbUF1dG9saW5rTGl0ZXJhbFRvTWFya2Rvd25cbn0gZnJvbSAnbWRhc3QtdXRpbC1nZm0tYXV0b2xpbmstbGl0ZXJhbCdcbmltcG9ydCB7XG4gIGdmbUZvb3Rub3RlRnJvbU1hcmtkb3duLFxuICBnZm1Gb290bm90ZVRvTWFya2Rvd25cbn0gZnJvbSAnbWRhc3QtdXRpbC1nZm0tZm9vdG5vdGUnXG5pbXBvcnQge1xuICBnZm1TdHJpa2V0aHJvdWdoRnJvbU1hcmtkb3duLFxuICBnZm1TdHJpa2V0aHJvdWdoVG9NYXJrZG93blxufSBmcm9tICdtZGFzdC11dGlsLWdmbS1zdHJpa2V0aHJvdWdoJ1xuaW1wb3J0IHtnZm1UYWJsZUZyb21NYXJrZG93biwgZ2ZtVGFibGVUb01hcmtkb3dufSBmcm9tICdtZGFzdC11dGlsLWdmbS10YWJsZSdcbmltcG9ydCB7XG4gIGdmbVRhc2tMaXN0SXRlbUZyb21NYXJrZG93bixcbiAgZ2ZtVGFza0xpc3RJdGVtVG9NYXJrZG93blxufSBmcm9tICdtZGFzdC11dGlsLWdmbS10YXNrLWxpc3QtaXRlbSdcblxuLyoqXG4gKiBDcmVhdGUgYW4gZXh0ZW5zaW9uIGZvciBgbWRhc3QtdXRpbC1mcm9tLW1hcmtkb3duYCB0byBlbmFibGUgR0ZNIChhdXRvbGlua1xuICogbGl0ZXJhbHMsIGZvb3Rub3Rlcywgc3RyaWtldGhyb3VnaCwgdGFibGVzLCB0YXNrbGlzdHMpLlxuICpcbiAqIEByZXR1cm5zIHtBcnJheTxGcm9tTWFya2Rvd25FeHRlbnNpb24+fVxuICogICBFeHRlbnNpb24gZm9yIGBtZGFzdC11dGlsLWZyb20tbWFya2Rvd25gIHRvIGVuYWJsZSBHRk0gKGF1dG9saW5rIGxpdGVyYWxzLFxuICogICBmb290bm90ZXMsIHN0cmlrZXRocm91Z2gsIHRhYmxlcywgdGFza2xpc3RzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdmbUZyb21NYXJrZG93bigpIHtcbiAgcmV0dXJuIFtcbiAgICBnZm1BdXRvbGlua0xpdGVyYWxGcm9tTWFya2Rvd24sXG4gICAgZ2ZtRm9vdG5vdGVGcm9tTWFya2Rvd24oKSxcbiAgICBnZm1TdHJpa2V0aHJvdWdoRnJvbU1hcmtkb3duLFxuICAgIGdmbVRhYmxlRnJvbU1hcmtkb3duLFxuICAgIGdmbVRhc2tMaXN0SXRlbUZyb21NYXJrZG93blxuICBdXG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGV4dGVuc2lvbiBmb3IgYG1kYXN0LXV0aWwtdG8tbWFya2Rvd25gIHRvIGVuYWJsZSBHRk0gKGF1dG9saW5rXG4gKiBsaXRlcmFscywgZm9vdG5vdGVzLCBzdHJpa2V0aHJvdWdoLCB0YWJsZXMsIHRhc2tsaXN0cykuXG4gKlxuICogQHBhcmFtIHtPcHRpb25zIHwgbnVsbCB8IHVuZGVmaW5lZH0gW29wdGlvbnNdXG4gKiAgIENvbmZpZ3VyYXRpb24uXG4gKiBAcmV0dXJucyB7VG9NYXJrZG93bkV4dGVuc2lvbn1cbiAqICAgRXh0ZW5zaW9uIGZvciBgbWRhc3QtdXRpbC10by1tYXJrZG93bmAgdG8gZW5hYmxlIEdGTSAoYXV0b2xpbmsgbGl0ZXJhbHMsXG4gKiAgIGZvb3Rub3Rlcywgc3RyaWtldGhyb3VnaCwgdGFibGVzLCB0YXNrbGlzdHMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2ZtVG9NYXJrZG93bihvcHRpb25zKSB7XG4gIHJldHVybiB7XG4gICAgZXh0ZW5zaW9uczogW1xuICAgICAgZ2ZtQXV0b2xpbmtMaXRlcmFsVG9NYXJrZG93bixcbiAgICAgIGdmbUZvb3Rub3RlVG9NYXJrZG93bigpLFxuICAgICAgZ2ZtU3RyaWtldGhyb3VnaFRvTWFya2Rvd24sXG4gICAgICBnZm1UYWJsZVRvTWFya2Rvd24ob3B0aW9ucyksXG4gICAgICBnZm1UYXNrTGlzdEl0ZW1Ub01hcmtkb3duXG4gICAgXVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-gfm/lib/index.js\n");

/***/ })

};
;