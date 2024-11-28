import { memo } from "react"

export const CanvasContainer=memo(({canvasRef, canvasOnMouseDown, canvasOnMouseMove, canvasOnMouseUp, canvasOnDblclick})=>{

    return <>
        <canvas id="canvas" tabIndex={1000} ref={canvasRef} width="1200" height="1200"  
            onMouseDown={(event)=>canvasOnMouseDown(event)} 
            onMouseMove={(event)=>canvasOnMouseMove(event)}
            onMouseUp={(event)=>canvasOnMouseUp(event)}
            onDoubleClick={(event)=>canvasOnDblclick(event)} > 
        </canvas>
    </>
})