/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export function setFloatingElemPosition(
  targetRect: DOMRect,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  isNearTop: boolean = false
): void {
  const anchorRect = anchorElem.getBoundingClientRect();
  const floatingElemRect = floatingElem.getBoundingClientRect();
  
  // By default, position above the selection
  let top = targetRect.top - floatingElemRect.height - 8; // 8px gap
  
  // If too close to top, position below
  if (isNearTop) {
    top = targetRect.bottom + 8; // 8px gap
  }
  
  const left = targetRect.left - anchorRect.left;

  floatingElem.style.transform = `translate3d(${left}px, ${top}px, 0)`;
}