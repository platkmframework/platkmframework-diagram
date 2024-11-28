
export function intersectsRect1ByRect2(rect1, rect2) {
    return !( rect2.x                 > (rect1.x + rect1.width) || 
             (rect2.x + rect2.width)  <  rect1.x           || 
             rect2.y                  > (rect1.y + rect1.height) ||
             (rect2.y + rect2.height) <  rect1.y);
}

export function intersectionPointToLines(x1, y1, x2, y2, x3, y3, x4, y4){
    var a_dx = x2 - x1;
    var a_dy = y2 - y1;
    var b_dx = x4 - x3;
    var b_dy = y4 - y3;
    var s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
    var t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1) ? {x:x1 + t * a_dx, y:y1 + t * a_dy} : null;
}

export function intersectionRectByLine(x, width, y, height, px1, py1, px2, py2){
    const vector= [
        {x1:x + width, y1:y, x2:x + width, y2:y + height}, //right vertical
        {x1:x, y1:y, x2:x, y2:y + height}, //left vertical
        {x1:x, y1:y, x2:x + width, y2:y}, //up horizontal
        {x1:x, y1:y + height, x2: x +  width, y2: y +  height}, //bottom horizontal */
    ]

    for (var i = 0; i < vector.length; i++){ 
        let point = intersectionPointToLines(
            vector[i].x1, vector[i].y1,
            vector[i].x2, vector[i].y2, 
            px1, py1,
            px2, py2);
        
        if(point != null) return point;
    }
    return null
}

export function isPointInsideRectangleByCanvas(ctx, x, width, y, height, px1, py1){
    let isInInterception = false;
    const vector= [
        {x1:x + width, y1:y, x2:x + width, y2:y + height}, //right vertical
        {x1:x, y1:y, x2:x, y2:y + height}, //left vertical
        {x1:x, y1:y, x2:x + width, y2:y}, //up horizontal
        {x1:x, y1:y + height, x2: x +  width, y2: y +  height}, //bottom horizontal */
    ]

    for (var i = 0; i < vector.length; i++){ 
        isInInterception = isPointInLine(ctx,
            px1, py1,
            vector[i].x1, vector[i].y1,
            vector[i].x2, vector[i].y2, 
            );
        
        if(isInInterception) i = vector.length;
    }
    return isInInterception
}

export function isPointInsideRectangle(x, width, y, height, px, py){
/*       console.log('px>= x',px, x, px>= x)
    console.log('px<= x+ width',px<= x+ width)
    console.log('py>= y',py>= y)
    console.log('py<= y+ height', py, y,     py<= y+ height )    */

    return px>= x && px<= x+ width && py>= y && py<= y+ height
}


export const isPointInLine =(ctx, px, py, x1, y1, x2, y2)=>{
    const path = new Path2D();
    path.lineTo(x1, y1);
    path.lineTo(x2, y2);
    ctx.lineWidth = 5;
    return ctx.isPointInStroke(path, px, py);
}


export function makeid(prefix) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 255) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return prefix + result;
}

export const generateKey = (pre) => {
    return pre + Math.random()
}
