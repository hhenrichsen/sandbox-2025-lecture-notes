import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Color,
  createEffect,
  createRef,
  createSignal,
  spawn,
} from "@motion-canvas/core";
import { getColors } from "../colors";

export default makeScene2D(function* (view) {
  // Get colors from the presentation theme
  const colors = getColors();
  const circle = createRef<Circle>();

  // Add the main circle with theme colors
  view.add(
    <Circle ref={circle} size={320} fill={colors.yellow} lineWidth={8} />
  );

  // Animate the circle
  yield* circle().scale(2, 2).to(1, 2);
});
