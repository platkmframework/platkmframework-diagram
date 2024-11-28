import { Button } from "@mui/material";
import React, { createRef, useEffect, useRef, useState } from "react"

import { generateKey, isPointInLine } from "../../js/canvasScripts";
import { drawShapeLineIntersection, drawIntersectionForSourceAndTargetElement, drawArrow} from "../../js/canvasShapeOperations";

import { v4 as uuidv4   } from 'uuid';
 
import { C_LIFE_LINE } from "../../constants/ShapeTypes";
import { DiagramModelerHook } from "../../hook/DiagramModelerHook";
import { CanvasContainer } from "../../hook/CanvasContainer";

import hand from '../../images/hand.svg'; 
import undo from '../../images/undo.svg'; 
import redo from '../../images/redo.svg'; 
import remove from '../../images/remove.svg';
 
  
import { LineShapeCreator } from "../../shapes/base/LineShapeCreator";  

import { ColumnShape } from "../shapes/ColumnShape";
import { EntityShape } from "../shapes/EntityShape";


export const EntitiesDiagramModeler = () =>{

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
     

    const addSimpleRectangle = (event)=>{
        event.preventDefault();
        event.stopPropagation()
 
        const jsonTables =[
            {
                'id': '1',
                name: 'Tuti Landia',
                label:'Tuti landia',
                comment:'',
                column:[

                ],
                pkContraint:{},
                fkContraint:{},
                indexContraint:{},
                importedKeys:{}
            }
        ]
 
       let list = [newTable('El papi', 100), newTable('Tuti',770)];
        setShapes(list)
        const aux =   newSelectedShapeData()
        draw2D(list, aux)
       

    }

    const newTable=(name, x)=>{

        let  auxRectangleShape = new EntityShape();
        auxRectangleShape.state.shape.name = name
        auxRectangleShape.state.shape.x = x
        let auxColumnShape= new ColumnShape({name:'ColumnShape', pk:false, })
        auxColumnShape.state.shape.x = x

        let auxColumnShape1= new ColumnShape({name:'ColumnShape1'})
        auxColumnShape.state.shape.y = auxRectangleShape.state.shape.y + 40
        auxColumnShape1.state.shape.y = auxColumnShape.state.shape.y + 20
        auxColumnShape1.state.shape.x = x
        auxRectangleShape.state.content=[auxColumnShape, auxColumnShape1]

        return auxRectangleShape;
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