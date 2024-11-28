import { Button } from "@mui/material";
import React, { createRef, useEffect, useRef, useState } from "react"

import { generateKey, isPointInLine } from "../../js/canvasScripts";
import { drawShapeLineIntersection, drawIntersectionForSourceAndTargetElement, drawArrow} from "../../js/canvasShapeOperations";

import { v4 as uuidv4   } from 'uuid';
import { LifelineShape } from "../shapes/LifelineShape";
import { AsynchronousMessageShape } from "../shapes/AsynchronousMessageShape";
import { AsynchronousMessageShapeCreator } from "../shapes/AsynchronousMessageShapeCreator";
import { C_LIFE_LINE } from "../../constants/ShapeTypes";
import { DiagramModelerHook } from "../../hook/DiagramModelerHook";
import { CanvasContainer } from "../../hook/CanvasContainer";

import hand from '../../images/hand.svg'; 
import undo from '../../images/undo.svg'; 
import redo from '../../images/redo.svg'; 
import remove from '../../images/remove.svg';

import lifeline from '../images/lifeline.svg'; 
import line from '../images/line.svg'; 


import executeSpecification from '../images/executeSpecification.svg'; 
import { RectangleShape } from "../../shapes/base/RectangleShape";
import { LineShapeCreator } from "../../shapes/base/LineShapeCreator";  


export const SequenceDiagramModeler = () =>{

    const asynchronousMessageShapeCreator = new AsynchronousMessageShapeCreator();
    const lineShapeCreator = new LineShapeCreator();
    
    const canvasRef = React.createRef();
    const {undoRedo, setUndoRedo,
        shapes, setShapes, 
        selectedShapeData, setSelectedShapeData,
        customShapeCreation, setCustomShapeCreation, 
        newSelectedShapeData,
        draw2D,
        defaultDraw2D,
        cleanCanvas,
        canvasOnMouseMove,
        canvasOnMouseDown,
        canvasOnMouseUp,
        canvasOnDblclick,
        canvasOnKeyDown,
        addNewShape,
        addNewShapeShapeData,
        addUndoRedoAction,
        applyUndo,
        applyRedo,
        applyUndoElementHandler,
        applyRedoElementHandler} = DiagramModelerHook(canvasRef)

    useEffect(()=>{

        addUndoRedoAction([...shapes])
        defaultDraw2D(shapes, selectedShapeData)

        document.addEventListener("keydown", canvasOnKeyDown);
       return () => document.removeEventListener("keydown", canvasOnKeyDown)

    }, [selectedShapeData.id])
    //}, [shapes,selectedShapeData ])


    //--------------------------BAR ACTIONS----------------------------
    const addLifeLineShapeHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation()

        let  auxLifelineShape = new LifelineShape();
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
                    let auxselectedShapeData = auxShapes[i].addExecutionSpecification(auxShapes)
                    
                    cleanCanvas()
                    setShapes(auxShapes)
                    setSelectedShapeData(auxselectedShapeData)
                    draw2D(auxShapes, auxselectedShapeData)

                    addUndoRedoAction(auxShapes)

                    break;
                }
            }
        }
    }

    const addAsynchronousMessageShapeHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation()

        asynchronousMessageShapeCreator.init([...shapes])
 
        setCustomShapeCreation(asynchronousMessageShapeCreator)

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
        cleanCanvas()
        draw2D(auxShapes, auxSelectedElement)

        addUndoRedoAction(auxShapes)
    }

    const navStartLineElementHandler = (event, type)=>{
        event.preventDefault();
        event.stopPropagation(); 
    }

    const addNavHandElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();
        setSelectedShapeData(newSelectedShapeData())
        setCustomShapeCreation({})
        cleanCanvas()
        defaultDraw2D()

    }


    const addSimpleRectangle = (event)=>{
        event.preventDefault();
        event.stopPropagation()

        let  auxRectangleShape = new RectangleShape();
        let auxSelectedShapeData = {id:auxRectangleShape.getShape().id, 
            type:auxRectangleShape.getShape().type,  
            subtypeId:'', 
            subtype:'', 
            mx:auxRectangleShape.getShape().x,
            my:auxRectangleShape.getShape().y,
            mousestyle:auxRectangleShape.getShape().mousestyle, 
            acceptedIncomingType: auxRectangleShape.getShape().acceptedIncomingType, 
            acceptedOutgoingType:auxRectangleShape.getShape().acceptedOutgoingType}

        addNewShapeShapeData(auxRectangleShape, auxSelectedShapeData);

    }

    const addSimpleLine = (event)=>{
        event.preventDefault();
        event.stopPropagation()

        lineShapeCreator.init([...shapes])
 
        setCustomShapeCreation(lineShapeCreator)

        if(selectedShapeData.id != ''){
            let auxselectedShapeData = {...selectedShapeData}
            auxselectedShapeData.customCreation = true;
            setSelectedShapeData(auxselectedShapeData)
        }
    }

    //--------------------------END BAR ACTIONS------------------------
 
    return (<> 
    
        <div className="alert alert-primary" role="alert"> 
            <span>
                <Button onClick={(event)=>{addNavHandElementHandler(event)}}>
                    <img src={hand} alt="Hand"   height={'30px'}/>
                </Button>
            </span>
            <span>
                <Button onClick={(event)=>{addLifeLineShapeHandler(event)}}>
                    <img src={lifeline} alt="LifeLine"  height={'30px'} />
                </Button>
            </span>
            <span>
                <Button onClick={(event)=>{addAsynchronousMessageShapeHandler(event)}}>
                    <img src={line} alt="Line"  height={'30px'} />
                </Button>
            </span>
            <span>
                <Button onClick={(event)=>{navStartExecutionSpecificationandler(event)}}>
                    <img src={executeSpecification} alt="ExecuteSpecification" height={'30px'}/>
                </Button>
            </span>
 {/*            <span>
                <Button onClick={(event)=>{removeSelectedElementHandler(event)}}>
                    <img src={remove} alt="Remove" height={'20px'}/>
                </Button>
            </span> */}
            <span>
                <Button onClick={(event)=>{applyUndoElementHandler(event)}}>
                    <img src={undo} alt="Undo" height={'25px'}/>
                </Button>
            </span>
            <span>
                <Button onClick={(event)=>{applyRedoElementHandler(event)}}>
                    <img src={redo} alt="Redo" height={'25px'}/>
                </Button>
            </span>

            <span>
                <Button onClick={(event)=>{addSimpleRectangle(event)}}>
                    Simple Rectangle
                </Button>
            </span>

            <span>
                <Button onClick={(event)=>{addSimpleLine(event)}}>
                    Simple Line
                </Button>
            </span>

{/*             <span><Button onClick={(event)=>{addLifeLineShapeHandler(event)}}>Agregar</Button></span>
            <span><Button onClick={(event)=>{addAsynchronousMessageShapeHandler(event)}}>Asynchronous Message</Button></span>
            <span><Button onClick={(event)=>{navStartLineElementHandler(event, 'Message_Call')}}> Call Message</Button></span>
            <span><Button onClick={(event)=>{navStartLineElementHandler(event, 'Message_Reply')}}> Reply Message</Button></span>
            <span><Button onClick={(event)=>{navStartExecutionSpecificationandler(event)}}> Execution Specification</Button></span>

            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Zoom +</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Zoom -</Button></span>
            <span><Button onClick={(event)=>{removeSelectedElementHandler(event)}}>Eliminar</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Recargar</Button></span>
            <span><Button onClick={(event)=>{applyUndoElementHandler(event)}}>Undo</Button></span>
            <span><Button onClick={(event)=>{applyRedoElementHandler(event)}}>Redo</Button></span> */}
            
        </div>
        <div>
        
            <CanvasContainer canvasRef={canvasRef} 
            canvasOnMouseDown={canvasOnMouseDown}
            canvasOnMouseMove={canvasOnMouseMove}
            canvasOnMouseUp={canvasOnMouseUp}
            canvasOnDblclick={canvasOnDblclick} />
        </div>
    </>)
}