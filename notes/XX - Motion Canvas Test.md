<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Motion Canvas Test](#motion-canvas-test)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Motion Canvas Test

<!-- vslide -->

```tsx motion-canvas
import { Circle, makeScene2D } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";
import { getColors } from "../colors";

export default makeScene2D(function* (view) {
  // Get colors from the presentation theme
  const colors = getColors();

  const circle = createRef<Circle>();
  view.add(
    <Circle ref={circle} size={320} fill={colors.yellow} lineWidth={8} />,
  );
  yield* circle().scale(2, 2).to(1, 2);
});
```

<!-- vslide -->

```tsx motion-canvas
import { Circle, makeScene2D } from "@motion-canvas/2d";
import { cancel, createRef, loop, beginSlide } from "@motion-canvas/core";
import { getColors } from "../colors";

export default makeScene2D(function* (view) {
  // Get colors from the presentation theme
  const colors = getColors();

  const circle = createRef<Circle>();
  view.add(
    <Circle ref={circle} size={320} fill={colors.yellow} lineWidth={8} />,
  );
  const task = yield loop(() => circle().scale(2, 2).to(1, 2));
  yield* beginSlide("next");
  cancel(task);
  yield circle().scale(1, 1);
  yield loop(() => circle().fill(colors.red, 2).to(colors.yellow, 2));
  yield* beginSlide("end");
  yield* circle().fill(colors.yellow, 1);
});
```
