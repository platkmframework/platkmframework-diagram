import { Button } from "@mui/material";
import { createRef, useEffect, useRef, useState } from "react"

import { generateKey, isPointInLine } from "../js/canvasScripts";
import { drawShapeLineIntersection, drawIntersectionForSourceAndTargetElement, drawArrow} from "../js/canvasShapeOperations";

import { v4 as uuidv4   } from 'uuid';


import { C_LIFE_LINE } from "../constants/ShapeTypes";
import { DiagramModelerHook } from "../hook/DiagramModelerHook";
import { LifelineShape } from "../sequence/shapes/LifelineShape";
import { AsynchronousMessageShapeCreator } from "../sequence/shapes/AsynchronousMessageShapeCreator";
import { StartTopLevelNoneEventShape } from "./shapes/events/StartTopLevelNoneEventShape";


export const BpmnDiagramModeler = () =>{

    const canvasRef = useRef(null);
    const {undoRedo, setUndoRedo,
        shapes, setShapes,
        flowLines, setFlowLines,
        selectedShapeData, setSelectedShapeData,
        customShapeCreation, setCustomShapeCreation, 
        newSelectedShapeData,
        draw2D,
        defaultDraw2D,
        canvasOnMouseMove,
        canvasOnMouseDown,
        canvasOnMouseUp,
        canvasOnDblclick,
        addNewShape,
        addNewShapeShapeData,
        addUndoRedoAction,
        applyUndo,
        applyRedo,
        applyUndoElementHandler,
        applyRedoElementHandler} = DiagramModelerHook(canvasRef)

    useEffect(()=>{
       addUndoRedoAction([...shapes],[...flowLines])
       defaultDraw2D(shapes, flowLines, selectedShapeData)
    }, [])


    //--------------------------BAR ACTIONS----------------------------
    const addLifeLineShapeHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation()

        let  auxLifelineShape = new StartTopLevelNoneEventShape();
        let auxSelectedShapeData = {id:auxLifelineShape.getShape().id, 
            type:auxLifelineShape.getShape().type,  
            subtypeId:'', 
            subtype:'', 
            mx:auxLifelineShape.getShape().x,
            my:auxLifelineShape.getShape().y,
            mousestyle:auxLifelineShape.getShape().mousestyle, 
            acceptedIncomingType: auxLifelineShape.getShape().acceptedIncomingType, 
            acceptedOutgoingType:auxLifelineShape.getShape().acceptedOutgoingType}

        addNewShapeShapeData(auxLifelineShape, auxSelectedShapeData);

    }

    const navStartExecutionSpecificationandler = (event)=>{
        event.preventDefault();
        event.stopPropagation()

        if(selectedShapeData.id != '' && selectedShapeData.type == C_LIFE_LINE){
             let auxShapes = [...shapes]
             for (var i = 0; i < shapes.length; i++){ 
                if(auxShapes[i].getShape().id == selectedShapeData.id){
                    let auxselectedShapeData = auxShapes[i].addExecutionSpecification()
                    
                    setSelectedShapeData(auxselectedShapeData)
                    setShapes(auxShapes)
                    canvasRef.current.getContext('2d').reset()
                    draw2D(auxShapes, flowLines, auxselectedShapeData)

                    addUndoRedoAction(auxShapes, [...flowLines])

                    break;
                }
            }
        }
    }

    const addAsynchronousMessageShapeHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation()

        let auxCustomShapeCreation = new AsynchronousMessageShapeCreator();
        setCustomShapeCreation(auxCustomShapeCreation)

        if(selectedShapeData.id != ''){
            let auxselectedShapeData = {...selectedShapeData}
            auxselectedShapeData.customCreation = true;
            setSelectedShapeData(auxselectedShapeData)
        }
    }

    const addNaveElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();
        
        let auxNewShape = {...newShape}
        auxNewShape.id = uuidv4();
        auxNewShape.properties.label = newShape.properties.label + "_" + (viewComponentCount + 1)
        setViewComponentCount(viewComponentCount + 1)
        let auxShapes = [...shapes]
        auxShapes.push(auxNewShape);
        setShapes(auxShapes);
        let auxSelectedElement = newSelectedShapeData();
        auxSelectedElement.id = auxNewShape.id
        setSelectedShapeData(auxSelectedElement)
        canvasRef.current.getContext('2d').reset()
        draw2D(auxShapes, flowLines, auxSelectedElement)

        addUndoRedoAction(auxShapes, [...flowLines])
    }

    const navStartLineElementHandler = (event, type)=>{
        event.preventDefault();
        event.stopPropagation(); 
    }

    const addNavHandElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();
    }

    const removeSelectedElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();

        if(selectedShapeData.id != ''){
            if(selectedShapeData.borderType == 'point_union'){

                let auxflowLines = [...flowLines]
                auxflowLines.map((line)=>{
                    line.points = line.points.filter((p)=>p.id != selectedShapeData.pointId);
                    return line
                })
                canvasRef.current.getContext('2d').reset();
                setFlowLines(auxflowLines)
                draw2D(shapes, auxflowLines, selectedShapeData)

                addUndoRedoAction([...shapes], auxflowLines)

            }else if(selectedShapeData.type == 'rect'){

                removeShapeAndLinesAssociated(selectedShapeData.id);

            }else if(selectedShapeData.type == 'line'){
                let auxFlowLines = [...flowLines]
                let auxShapes = [...shapes]

                const auxLine = auxFlowLines.find(line=>line.id == selectedShapeData.id)
                auxFlowLines = auxFlowLines.filter(line=>line.id != auxLine.id)
                auxShapes    =  auxShapes.map(s=>{
                    if(s.id == auxLine.sourceId){
                        s.outgoing = s.outgoing.filter((lineId)=> lineId != auxLine.id)
                    }
                    if(s.id == auxLine.targetId){
                        s.incoming = s.incoming.filter((lineId)=> lineId != auxLine.id)
                    }
                    return s;
                })

                setFlowLines(auxFlowLines)
                setShapes(auxShapes);
                
                const auxSelectedElem = newSelectedShapeData();
                setSelectedShapeData(auxSelectedElem)
                canvasRef.current.getContext('2d').reset();
                draw2D(auxShapes, auxFlowLines, auxSelectedElem)

                addUndoRedoAction(auxShapes, auxFlowLines)
            }
        }
         
    }

    const removeShapeAndLinesAssociated = (shapeId)=>{

        let auxShapes = [...shapes]

        const auxShape = auxShapes.find(s=>s.id == shapeId)
        const lines = auxShape.incoming.concat(auxShape.outgoing);

        lines.forEach(currentLineId=>{
            const auxLine = auxFlowLines.find(line=>line.id == currentLineId)
            auxFlowLines = auxFlowLines.filter(line=>line.id != auxLine.id)
            auxShapes    =  auxShapes.map(s=>{
                if(s.id == auxLine.sourceId){
                    s.outgoing = s.outgoing.filter((lineId)=> lineId != auxLine.id)
                }
                if(s.id == auxLine.targetId){
                    s.incoming = s.incoming.filter((lineId)=> lineId != auxLine.id)
                }
                return s;
            })
        })
        
        auxShapes = auxShapes.filter(s=>s.id != auxShape.id)

        setFlowLines(auxFlowLines)
        setShapes(auxShapes);
        const auxSelectedElem = newSelectedShapeData();
        setSelectedShapeData(auxSelectedElem)
        addUndoRedoAction(auxShapes, auxFlowLines)
        canvasRef.current.getContext('2d').reset();
        draw2D(auxShapes, auxFlowLines, auxSelectedElem)

    }

    //--------------------------END BAR ACTIONS------------------------
 
    return (<> 
    
        <div className="alert alert-primary" role="alert">
            <div>Business process diagram</div>
            <span><Button onClick={(event)=>{addNavHandElementHandler(event)}}>Hand</Button></span>
            <span><Button onClick={(event)=>{addLifeLineShapeHandler(event)}}>Agregar</Button></span>
            <span><Button onClick={(event)=>{addAsynchronousMessageShapeHandler(event)}}>Asynchronous Message</Button></span>
            <span><Button onClick={(event)=>{navStartLineElementHandler(event, 'Message_Call')}}> Call Message</Button></span>
            <span><Button onClick={(event)=>{navStartLineElementHandler(event, 'Message_Reply')}}> Reply Message</Button></span>
            <span><Button onClick={(event)=>{navStartExecutionSpecificationandler(event)}}> Execution Specification</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Zoom +</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Zoom -</Button></span>
            <span><Button onClick={(event)=>{removeSelectedElementHandler(event)}}>Eliminar</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Recargar</Button></span>
            <span><Button onClick={(event)=>{applyUndoElementHandler(event)}}>Undo</Button></span>
            <span><Button onClick={(event)=>{applyRedoElementHandler(event)}}>Redo</Button></span>
        </div>
        <div>
            <canvas id="canvas"  ref={canvasRef} width="1200" height="1200"  
            onMouseDown={(event)=>canvasOnMouseDown(event)} 
            onMouseMove={(event)=>canvasOnMouseMove(event)}
            onMouseUp={(event)=>canvasOnMouseUp(event)}
            onDoubleClick={(event)=>canvasOnDblclick(event) }> 
            </canvas>
        </div>
    </>)
}