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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var convex_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! convex/react */ \"(app-pages-browser)/./node_modules/convex/dist/esm/react/index.js\");\n/* harmony import */ var _convex_generated_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/convex/_generated/api */ \"(app-pages-browser)/./convex/_generated/api.js\");\n/* harmony import */ var _components_ui_button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/components/ui/button */ \"(app-pages-browser)/./components/ui/button.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\nconst ProjectIdPage = (param)=>{\n    let { params } = param;\n    _s();\n    const project = (0,convex_react__WEBPACK_IMPORTED_MODULE_1__.useQuery)(_convex_generated_api__WEBPACK_IMPORTED_MODULE_2__.api.projects.getById, {\n        projectId: params.projectId\n    });\n    if (project === undefined) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            children: \"Loading...\"\n        }, void 0, false, {\n            fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n            lineNumber: 21,\n            columnNumber: 7\n        }, undefined);\n    }\n    if (project === null) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            children: \"Project not found\"\n        }, void 0, false, {\n            fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n            lineNumber: 29,\n            columnNumber: 7\n        }, undefined);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"md:max-w-3xl lg:max-w-4xl mx-auto pt-100 flex justify-between\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                    className: \"text-xl font-semibold\",\n                    children: \"Welcome to Listoriq\"\n                }, void 0, false, {\n                    fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n                    lineNumber: 39,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_button__WEBPACK_IMPORTED_MODULE_3__.Button, {\n                    className: \"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\",\n                    children: \"Click Me\"\n                }, void 0, false, {\n                    fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n                    lineNumber: 40,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n            lineNumber: 38,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/Users/kursadkozelo/epics/app/(main)/(routes)/projects/[projectId]/page.tsx\",\n        lineNumber: 37,\n        columnNumber: 5\n    }, undefined);\n};\n_s(ProjectIdPage, \"H8vTX7pKzCbu9MnHPNX6T7WFDOE=\", false, function() {\n    return [\n        convex_react__WEBPACK_IMPORTED_MODULE_1__.useQuery\n    ];\n});\n_c = ProjectIdPage;\n/* harmony default export */ __webpack_exports__[\"default\"] = (ProjectIdPage);\nvar _c;\n$RefreshReg$(_c, \"ProjectIdPage\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC8obWFpbikvKHJvdXRlcykvcHJvamVjdHMvW3Byb2plY3RJZF0vcGFnZS50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUV1QztBQUdNO0FBQ0U7QUFTL0MsTUFBTUcsZ0JBQWlCO1FBQUMsRUFBRUMsTUFBTSxFQUFzQjs7SUFDcEQsTUFBTUMsVUFBVUwsc0RBQVFBLENBQUNDLHNEQUFHQSxDQUFDSyxRQUFRLENBQUNDLE9BQU8sRUFBRTtRQUFFQyxXQUFXSixPQUFPSSxTQUFTO0lBQUM7SUFFN0UsSUFBSUgsWUFBWUksV0FBVztRQUN6QixxQkFDRSw4REFBQ0M7c0JBQUk7Ozs7OztJQUlUO0lBRUEsSUFBSUwsWUFBWSxNQUFNO1FBQ3BCLHFCQUNFLDhEQUFDSztzQkFBSTs7Ozs7O0lBSVQ7SUFHQSxxQkFDRSw4REFBQ0E7a0JBQ0MsNEVBQUNBO1lBQUlDLFdBQVU7OzhCQUNiLDhEQUFDQztvQkFBR0QsV0FBVTs4QkFBd0I7Ozs7Ozs4QkFDdEMsOERBQUNULHlEQUFNQTtvQkFBQ1MsV0FBVTs4QkFBdUU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTWpHO0dBOUJNUjs7UUFDWUgsa0RBQVFBOzs7S0FEcEJHO0FBZ0NOLCtEQUFlQSxhQUFhQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL2FwcC8obWFpbikvKHJvdXRlcykvcHJvamVjdHMvW3Byb2plY3RJZF0vcGFnZS50c3g/OGYzMiJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBjbGllbnRcIlxuXG5pbXBvcnQgeyB1c2VRdWVyeSB9IGZyb20gXCJjb252ZXgvcmVhY3RcIlxuXG5pbXBvcnQgeyBJZCB9IGZyb20gXCJAL2NvbnZleC9fZ2VuZXJhdGVkL2RhdGFNb2RlbFwiXG5pbXBvcnQgeyBhcGkgfSBmcm9tIFwiQC9jb252ZXgvX2dlbmVyYXRlZC9hcGlcIlxuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIkAvY29tcG9uZW50cy91aS9idXR0b25cIlxuXG5pbnRlcmZhY2UgUHJvamVjdElkUGFnZVByb3BzIHtcbiAgcGFyYW1zOiB7XG4gICAgcHJvamVjdElkOiBJZDxcInByb2plY3RzXCI+XG4gIH1cbn1cblxuXG5jb25zdCBQcm9qZWN0SWRQYWdlICA9ICh7IHBhcmFtcyB9OiBQcm9qZWN0SWRQYWdlUHJvcHMpID0+IHtcbiAgY29uc3QgcHJvamVjdCA9IHVzZVF1ZXJ5KGFwaS5wcm9qZWN0cy5nZXRCeUlkLCB7IHByb2plY3RJZDogcGFyYW1zLnByb2plY3RJZCB9KTtcblxuICBpZiAocHJvamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIExvYWRpbmcuLi5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGlmIChwcm9qZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIFByb2plY3Qgbm90IGZvdW5kXG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWQ6bWF4LXctM3hsIGxnOm1heC13LTR4bCBteC1hdXRvIHB0LTEwMCBmbGV4IGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LXNlbWlib2xkXCI+V2VsY29tZSB0byBMaXN0b3JpcTwvaDI+XG4gICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiYmctYmx1ZS01MDAgaG92ZXI6YmctYmx1ZS03MDAgdGV4dC13aGl0ZSBmb250LWJvbGQgcHktMiBweC00IHJvdW5kZWRcIj5cbiAgICAgICAgICBDbGljayBNZVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUHJvamVjdElkUGFnZTtcblxuIl0sIm5hbWVzIjpbInVzZVF1ZXJ5IiwiYXBpIiwiQnV0dG9uIiwiUHJvamVjdElkUGFnZSIsInBhcmFtcyIsInByb2plY3QiLCJwcm9qZWN0cyIsImdldEJ5SWQiLCJwcm9qZWN0SWQiLCJ1bmRlZmluZWQiLCJkaXYiLCJjbGFzc05hbWUiLCJoMiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/(main)/(routes)/projects/[projectId]/page.tsx\n"));

/***/ })

});