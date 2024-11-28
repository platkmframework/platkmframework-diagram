import { intersectionPointToLines } from "./canvasScripts";


export const drawIntersectionForSourceAndTargetElement = (ctx, shapeSource, shapeTarget, line)=>{
    const targetVectors = getRectangleVectorArray(shapeSource);
    const sourceVectors = getRectangleVectorArray(shapeTarget);

    targetVectors.map(vector=>{
        drawIntersectionPoint2Vector(ctx, 
            vector, 
            { 
                x1:line.getShape().points[0].x, 
                y1:line.getShape().points[0].y,
                x2:line.getShape().points[1].x,
                y2: line.getShape().points[1].y
            });
    })

    sourceVectors.map(vector=>{
        drawIntersectionPoint2Vector(ctx,
            vector,
              { 
              x1:line.getShape().points[line.getShape().points.length-2].x, 
              y1:line.getShape().points[line.getShape().points.length-2].y,
              x2:line.getShape().points[line.getShape().points.length-1].x,
              y2: line.getShape().points[line.getShape().points.length-1].y
          }); 
    })

}

/**
     * 
     * @param {*} ctx 
     * @param {*} shape 
     */
export const  drawShapeLineIntersection = (ctx, shape, shapes, flowLines)=>{
    if(shape.getShape().type == "rect"){
        //rectangle
        let vectors = getRectangleVectorArray(shape);
        shape.incoming.map((incomingId)=>{
            let line = flowLines.find(line=>line.id == incomingId);
            vectors.map(vector=>{
                drawIntersectionPoint2Vector(ctx,
                    vector,
                      { 
                      x1:line.points[line.points.length-2].x, 
                      y1:line.points[line.points.length-2].y,
                      x2:line.points[line.points.length-1].x,
                      y2: line.points[line.points.length-1].y
                  }); 
            })
            let otherVectors = getRectangleVectorArray(shapes.find(s=> s.getShape().id == line.getShape().sourceId));
                otherVectors.map(vector=>{
                    drawIntersectionPoint2Vector(ctx, 
                        vector, 
                        { 
                            x1:line.getShape().points[0].x, 
                            y1:line.getShape().points[0].y,
                            x2:line.getShape().points[1].x,
                            y2: line.getShape().points[1].y
                        });
                })
        })
        shape.getShape().outgoing.map((outgoingId)=>{
            let line = flowLines.find(line=>line.getShape().id == outgoingId);
            if(line){
                vectors.map(vector=>{ 
                    drawIntersectionPoint2Vector(ctx,
                        vector,
                        { 
                        x1:line.getShape().points[0].x, 
                        y1:line.getShape().points[0].y,
                        x2:line.getShape().points[1].x,
                        y2: line.getShape().points[1].y
                    }); 
                })
                //check iterception other shape
                let otherVectors = getRectangleVectorArray(shapes.find(s=> s.getShape().id == line.getShape().targetId));
                otherVectors.map(vector=>{
                    drawIntersectionPoint2Vector(ctx, 
                        vector, 
                        { 
                            x1:line.getShape().points[line.getShape().points.length-2].x, 
                            y1:line.getShape().points[line.getShape().points.length-2].y,
                            x2:line.getShape().points[line.getShape().points.length-1].x,
                            y2: line.getShape().points[line.getShape().points.length-1].y
                        });
                })
            }
        })
    }
}

    /**
     * right vertical
     * left vertical
     * up horizontal
     * bottom horizontal 
     * @param {*} shape 
     * @returns 
     */
    export const getRectangleVectorArray=(shape)=>{
        return [
            {x1:shape.getShape().x + shape.getShape().width, y1:shape.getShape().y, x2:shape.getShape().x + shape.getShape().width, y2:shape.getShape().y + shape.getShape().height}, //right vertical
            {x1:shape.getShape().x, y1:shape.getShape().y, x2:shape.getShape().x, y2:shape.getShape().y + shape.getShape().height}, //left vertical
            {x1:shape.getShape().x, y1:shape.getShape().y, x2:shape.getShape().x + shape.getShape().width, y2:shape.getShape().y}, //up horizontal
            {x1:shape.getShape().x, y1:shape.getShape().y + shape.getShape().height, x2:shape.getShape().x + shape.getShape().width, y2:shape.getShape().y + shape.getShape().height}, //bottom horizontal */
        ]
    }


    
 /**
  * 
  * @param {*} ctx 
  * @param {*} vector1 
  * @param {*} vector2 
  */
 export const drawIntersectionPoint2Vector = (ctx, vector1, vector2)=>{
    let point = intersectionPointToLines(
        vector1.x1, vector1.y1,
        vector1.x2, vector1.y2, 
        vector2.x1, vector2.y1,
        vector2.x2, vector2.y2);

    if(point != null){
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill(); 
        ctx.stroke();
    }
    //console.log(point)
}


export function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color){
    //variables to be used when creating the arrow
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);
 
    ctx.save();
    ctx.strokeStyle = color;
 
    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();
 
    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
               toy-headlen*Math.sin(angle+Math.PI/7));
 
    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //draws the paths created above
    ctx.stroke();
    ctx.restore();
}