"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/(main)/(routes)/projects/[projectId]/page",{

/***/ "(app-pages-browser)/./app/(main)/(routes)/projects/[projectId]/page.tsx":
/*!***********************************************************!*\
  !*** ./app/(main)/(routes)/projects/[projectId]/page.tsx ***!
  \***********************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var convex_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! convex/react */ \"(app-pages-browser)/./node_modules/convex/dist/esm/react/index.js\");\n/* harmony import */ var _convex_generated_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/convex/_generated/api */ \"(app-pages-browser)/./convex/_generated/api.js\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\nconst ProjectIdPage = (param)=>{\n    let { params } = param;\n    _s();\n    const project = (0,convex_react__WEBPACK_IMPORTED_MODULE_1__.useQuery)(_convex_generated_api__WEBPACK_IMPORTED_MODULE_2__.api.projects.getById, {\n        projectId: params.projectId\n    });\n    if (project === undefined) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            children: \"Loading...\"\n        }, void 0, false, {\n            fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n            lineNumber: 21,\n            columnNumber: 7\n        }, undefined);\n    }\n    if (project === null) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            children: \"Project not found\"\n        }, void 0, false, {\n            fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n            lineNumber: 29,\n            columnNumber: 7\n        }, undefined);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {}, void 0, false, {\n        fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n        lineNumber: 37,\n        columnNumber: 5\n    }, undefined);\n};\n_s(ProjectIdPage, \"H8vTX7pKzCbu9MnHPNX6T7WFDOE=\", false, function() {\n    return [\n        convex_react__WEBPACK_IMPORTED_MODULE_1__.useQuery\n    ];\n});\n_c = ProjectIdPage;\n/* harmony default export */ __webpack_exports__[\"default\"] = (ProjectIdPage);\nvar _c;\n$RefreshReg$(_c, \"ProjectIdPage\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC8obWFpbikvKHJvdXRlcykvcHJvamVjdHMvW3Byb2plY3RJZF0vcGFnZS50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRXVDO0FBR007QUFVN0MsTUFBTUUsZ0JBQWlCO1FBQUMsRUFBRUMsTUFBTSxFQUFzQjs7SUFDcEQsTUFBTUMsVUFBVUosc0RBQVFBLENBQUNDLHNEQUFHQSxDQUFDSSxRQUFRLENBQUNDLE9BQU8sRUFBRTtRQUFFQyxXQUFXSixPQUFPSSxTQUFTO0lBQUM7SUFFN0UsSUFBSUgsWUFBWUksV0FBVztRQUN6QixxQkFDRSw4REFBQ0M7c0JBQUk7Ozs7OztJQUlUO0lBRUEsSUFBSUwsWUFBWSxNQUFNO1FBQ3BCLHFCQUNFLDhEQUFDSztzQkFBSTs7Ozs7O0lBSVQ7SUFHQSxxQkFDRSw4REFBQ0E7Ozs7O0FBSUw7R0F6Qk1QOztRQUNZRixrREFBUUE7OztLQURwQkU7QUEyQk4sK0RBQWVBLGFBQWFBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vYXBwLyhtYWluKS8ocm91dGVzKS9wcm9qZWN0cy9bcHJvamVjdElkXS9wYWdlLnRzeD84ZjMyIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGNsaWVudFwiXG5cbmltcG9ydCB7IHVzZVF1ZXJ5IH0gZnJvbSBcImNvbnZleC9yZWFjdFwiXG5cbmltcG9ydCB7IElkIH0gZnJvbSBcIkAvY29udmV4L19nZW5lcmF0ZWQvZGF0YU1vZGVsXCJcbmltcG9ydCB7IGFwaSB9IGZyb20gXCJAL2NvbnZleC9fZ2VuZXJhdGVkL2FwaVwiXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiQC9jb21wb25lbnRzL3VpL2J1dHRvblwiXG5cbmludGVyZmFjZSBQcm9qZWN0SWRQYWdlUHJvcHMge1xuICBwYXJhbXM6IHtcbiAgICBwcm9qZWN0SWQ6IElkPFwicHJvamVjdHNcIj5cbiAgfVxufVxuXG5cbmNvbnN0IFByb2plY3RJZFBhZ2UgID0gKHsgcGFyYW1zIH06IFByb2plY3RJZFBhZ2VQcm9wcykgPT4ge1xuICBjb25zdCBwcm9qZWN0ID0gdXNlUXVlcnkoYXBpLnByb2plY3RzLmdldEJ5SWQsIHsgcHJvamVjdElkOiBwYXJhbXMucHJvamVjdElkIH0pO1xuXG4gIGlmIChwcm9qZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgTG9hZGluZy4uLlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgaWYgKHByb2plY3QgPT09IG51bGwpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgUHJvamVjdCBub3QgZm91bmRcbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuXG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQcm9qZWN0SWRQYWdlO1xuXG4iXSwibmFtZXMiOlsidXNlUXVlcnkiLCJhcGkiLCJQcm9qZWN0SWRQYWdlIiwicGFyYW1zIiwicHJvamVjdCIsInByb2plY3RzIiwiZ2V0QnlJZCIsInByb2plY3RJZCIsInVuZGVmaW5lZCIsImRpdiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/(main)/(routes)/projects/[projectId]/page.tsx\n"));

/***/ })

});