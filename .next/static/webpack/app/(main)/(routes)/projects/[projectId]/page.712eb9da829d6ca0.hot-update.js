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

/***/ "(app-pages-browser)/./components/epics-list.tsx":
/*!***********************************!*\
  !*** ./components/epics-list.tsx ***!
  \***********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var convex_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! convex/react */ \"(app-pages-browser)/./node_modules/convex/dist/esm/react/index.js\");\n/* harmony import */ var _convex_generated_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/convex/_generated/api */ \"(app-pages-browser)/./convex/_generated/api.js\");\n/* __next_internal_client_entry_do_not_use__  auto */ \nvar _s = $RefreshSig$();\n\n\nconst EpicsList = (param)=>{\n    let { projectId } = param;\n    _s();\n    const epics = (0,convex_react__WEBPACK_IMPORTED_MODULE_1__.useQuery)(_convex_generated_api__WEBPACK_IMPORTED_MODULE_2__.api.epics.getByProjectId, {\n        projectId\n    });\n    if (!epics) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            children: \"Loading epics...\"\n        }, void 0, false, {\n            fileName: \"/Users/kursadkozelo/epics/components/epics-list.tsx\",\n            lineNumber: 10,\n            columnNumber: 14\n        }, undefined);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {}, void 0, false, {\n        fileName: \"/Users/kursadkozelo/epics/components/epics-list.tsx\",\n        lineNumber: 13,\n        columnNumber: 5\n    }, undefined);\n};\n_s(EpicsList, \"Iz9rdzvlRLK6lg+aBlWdtk3w56A=\", false, function() {\n    return [\n        convex_react__WEBPACK_IMPORTED_MODULE_1__.useQuery\n    ];\n});\n_c = EpicsList;\nexp;\nvar _c;\n$RefreshReg$(_c, \"EpicsList\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2NvbXBvbmVudHMvZXBpY3MtbGlzdC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRXVDO0FBQ007QUFFN0MsTUFBTUUsWUFBWTtRQUFDLEVBQUVDLFNBQVMsRUFBRTs7SUFDNUIsTUFBTUMsUUFBUUosc0RBQVFBLENBQUNDLHNEQUFHQSxDQUFDRyxLQUFLLENBQUNDLGNBQWMsRUFBRTtRQUFFRjtJQUFVO0lBRTdELElBQUksQ0FBQ0MsT0FBTztRQUNWLHFCQUFPLDhEQUFDRTtzQkFBSTs7Ozs7O0lBQ2Q7SUFDRixxQkFDRSw4REFBQ0E7Ozs7O0FBSUw7R0FYTUo7O1FBQ1lGLGtEQUFRQTs7O0tBRHBCRTtBQWFOSyIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9jb21wb25lbnRzL2VwaWNzLWxpc3QudHN4P2M3MTEiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgY2xpZW50XCJcblxuaW1wb3J0IHsgdXNlUXVlcnkgfSBmcm9tIFwiY29udmV4L3JlYWN0XCJcbmltcG9ydCB7IGFwaSB9IGZyb20gXCJAL2NvbnZleC9fZ2VuZXJhdGVkL2FwaVwiXG5cbmNvbnN0IEVwaWNzTGlzdCA9ICh7IHByb2plY3RJZCB9KSA9PiB7XG4gICAgY29uc3QgZXBpY3MgPSB1c2VRdWVyeShhcGkuZXBpY3MuZ2V0QnlQcm9qZWN0SWQsIHsgcHJvamVjdElkIH0pO1xuICBcbiAgICBpZiAoIWVwaWNzKSB7XG4gICAgICByZXR1cm4gPGRpdj5Mb2FkaW5nIGVwaWNzLi4uPC9kaXY+O1xuICAgIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgXG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwXG5cbiJdLCJuYW1lcyI6WyJ1c2VRdWVyeSIsImFwaSIsIkVwaWNzTGlzdCIsInByb2plY3RJZCIsImVwaWNzIiwiZ2V0QnlQcm9qZWN0SWQiLCJkaXYiLCJleHAiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./components/epics-list.tsx\n"));

/***/ })

});