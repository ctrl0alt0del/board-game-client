export type EasingFunction = (coef: number) => number;
export const linearEasing: EasingFunction = x => x;
export const easeInSine: EasingFunction = x => 1 - Math.cos(x * Math.PI / 2);
export const easeOutSine: EasingFunction = x => Math.sin(x * Math.PI / 2);

export const randomEasingOf = (easeFns: EasingFunction[]) => {
    const randomIndex = Math.floor(Math.random() * easeFns.length);
    return easeFns[randomIndex];
}