import { Button } from "@mui/material";
import { cloneElement, createRef, useEffect, useRef, useState } from "react"

import { generateKey, isPointInLine } from "../js/canvasScripts";
import { v4 as uuidv4   } from 'uuid';
import { newSelectedShapeData } from "../js/canvasDrawFunction";
import { shape } from "prop-types";



export const DiagramModelerHook = (canvasRef) =>{
    const canvasRefOffScreen = useRef(null);
    const [viewComponentCount, setViewComponentCount] = useState(-1) 

    const [undoRedo, setUndoRedo] = useState({list:[], index:-1})

    const [shapes, setShapes] = useState([]) 

    //--selected element
    const [selectedShapeData, setSelectedShapeData] = useState({index:-1, id:'',parentId:'', type:'',subtype:'', mx:'', my:'', moveStarted:false, customCreation:false, pointId:'', newPointId:'', borderType:''});

    //--custom shape creation
    const [customShapeCreation, setCustomShapeCreation] = useState({})
    
    // START CREATE NEW SELECTED SHAPE OBJECT
    //const newSelectedShapeData=()=>{return {index:-1, id:'', type:'', subtype:'', mx:'', my:'', moveStarted:false, pointId:'', newPointId:'', borderType:''}}

    useEffect(()=>{
       if(canvasRefOffScreen.current == null)
            canvasRefOffScreen.current = canvasRef.current.transferControlToOffscreen();

        let ctx  = canvasRefOffScreen.current.getContext('2d');
       // ctx.fillText("Hello world", 10, 50);

       addUndoRedoAction([...shapes])
       defaultDraw2D()
    
    }, [])


    const getNextUniqueId = (prefix)=>{ 
        return generateKey(prefix);
    }


    /** FUNCTION DRAW*/
    const cleanCanvas=()=>{
        const ctx = canvasRefOffScreen.current.getContext('2d')
        ctx.clearRect(0, 0, 1200, 1200);
    }

    const draw2D=(shapeList, selectedShapeData)=>{
        const ctx = canvasRefOffScreen.current.getContext('2d')  
       
        shapeList.map(r=>{
            r.draw(ctx, selectedShapeData, shapeList)
        })  
    }

    const defaultDraw2D =() =>{
        draw2D(shapes, selectedShapeData)
    }
    /** END FUNCTION DRAW*/


    /** -----------------ADD NEW SHAPE ---------------------**/
    const addNewShape=(shape)=>{
        let auxshapes = [...shapes]
        auxshapes.push(shape)
        setShapes(auxshapes);

        let auxSelectedElement = newSelectedShapeData();
        auxSelectedElement.id = shape.getShape().id
        setSelectedShapeData(auxSelectedElement)

        const ctx = canvasRefOffScreen.current.getContext('2d')
       //ctx.reset();  
       ctx.clearRect(0, 0, 1200, 1200);
        draw2D(auxshapes, auxSelectedElement)
    }

    const addNewShapeShapeData=(shape, selectedShapeData)=>{
        let auxshapes = [...shapes]
        auxshapes.push(shape)
        setShapes(auxshapes);

        setSelectedShapeData(selectedShapeData)

        const ctx = canvasRefOffScreen.current.getContext('2d')
       // ctx.reset();  
       ctx.clearRect(0, 0, 1200, 1200); 
        draw2D(auxshapes, selectedShapeData)
    }
    /** -----------------END NEW SHAPE ---------------------**/


    /**-----------------  MOUSE HANDLER ----------------------*/
    const canvasOnMouseMove = (event)=>{
        event.preventDefault();
        event.stopPropagation(); 

        (async () => {
            mouseOverElementCursor(event)
        })();

        if(selectedShapeData.customCreation){
            let shapeResult = customShapeCreation.onMouseMove(event, canvasRef, canvasRefOffScreen, selectedShapeData, draw2D)
            if(shapeResult && shapeResult != null){
                setCustomShapeCreation({})
                addNewShape(shapeResult);
            }

        }else if(selectedShapeData.id != '' && selectedShapeData.moveStarted){ 
             
            let shapesAux = [...shapes]
            let found = false

            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;

            const ctx = canvasRefOffScreen.current.getContext('2d')
            selectedShapeData.currentShape.moveSelected(ctx, selectedShapeData, shapes, mx, my)
            //ctx.reset();
            ctx.clearRect(0, 0, 1200, 1200);
            setShapes(shapesAux)
            draw2D(shapesAux, selectedShapeData)
        }
    }

    const canvasOnMouseDown = (event)=>{
        event.preventDefault();
        event.stopPropagation(); 

        if(selectedShapeData.customCreation){
            if(customShapeCreation.onMouseDown(event, canvasRef, canvasRefOffScreen, selectedShapeData, draw2D)){
              //  canvasRefOffScreen.getContext('2d').reset()
                setShapes(customShapeCreation.state.shapes)
                setSelectedShapeData(customShapeCreation.state.selectedShapeData)
                cleanCanvas()
                draw2D(customShapeCreation.state.shapes, customShapeCreation.state.selectedShapeData)
                addUndoRedoAction(customShapeCreation.state.shapes)

                setCustomShapeCreation({})
            }
        }else{
            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;
            let auxNewSelectedShapeData = newSelectedShapeData();
            let auxSelectedShapeData = {id:''};
            let ctx = canvasRefOffScreen.current.getContext('2d')
            for (var i = 0; i < shapes.length; i++){ 
                auxSelectedShapeData = shapes[i].getSelectedByMouseCoordinates(ctx, mx, my);
                if(auxSelectedShapeData.id != ''){
                    auxNewSelectedShapeData = auxSelectedShapeData
                    auxNewSelectedShapeData.moveStarted = true;
                    //auxNewSelectedShapeData.currentShape = shapes[i]
                    //auxNewSelectedShapeData.shape = shapes[i].cloneElement()
                    break;
                }
            }
            canvasRefOffScreen.current.getContext('2d').reset()
            setSelectedShapeData(auxNewSelectedShapeData)
            draw2D(shapes, auxNewSelectedShapeData)
        }
    }

    const canvasOnMouseUp = (event)=>{
        event.preventDefault();
        event.stopPropagation(); 

        if(selectedShapeData.customCreation){
            let shapeResult = customShapeCreation.onMouseUp(event, canvasRef, canvasRefOffScreen)
            if(shapeResult && shapeResult != null){
                setCustomShapeCreation({})
                addNewShape(shapeResult);
            }
        }else if(selectedShapeData.id != '' && selectedShapeData.moveStarted){

            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;
            let found = false;
            let shapesAux = [...shapes]

            //console.log('move stop', shapesAux)
            const ctx = canvasRefOffScreen.current.getContext('2d')
            selectedShapeData.currentShape.movingStopped(ctx, selectedShapeData, shapesAux, mx, my);
            finishMouseUp(ctx, selectedShapeData, shapesAux, mx, my)

        }
    }

    /**
     * Buscar el cotenedor que no sea el mismo, mas dentro de cualquier otro que acepte a esta figura
     * -Si es el mismo donde esta contenido no hace nada
     * -Si queda fuera de un contenedor, se quita el id de su contenedor
     * y se quita del listado de su contenedor
     * -Si queda dentro de otro contenedor, se agrega al nuevo conenedor
     * se ajusta dentro del nuevo contenedor
     * y se quita del contenedor anterior
     * @param {*} ctx 
     * @param {*} selectedShapeData 
     * @param {*} shapesAux 
     * @param {*} mx 
     * @param {*} my 
     */
    const finishMouseUp = (ctx, selectedShapeData, shapes, mx, my)=>{
        
         let containerFound = null
         let isContainerFound = false;
        //buscar contenedor en coordenadas que no sea la figura actual
        for (var i = 0; i < shapes.length; i++) { 
            containerFound = shapes[i].findByCoordinatesAndAcceptanceType(ctx, mx, my, shapes, selectedShapeData.currentShape.getShape().type, true, [selectedShapeData.currentShape.getShape().id])
            if(containerFound && containerFound !=null){ 
                i = shapes.length;
                isContainerFound = true;
            }
        }
        
        if(!isContainerFound){
          
              //si tiene padre contenedor quitarlo de su padre
            if(selectedShapeData.currentShape.getShape().containerParentId != ''){
                let currentParentCont
                for (var i = 0; i < shapes.length; i++) { 
                    currentParentCont = shapes[i].findById(selectedShapeData.currentShape.getShape().containerParentId);
                    if(currentParentCont && currentParentCont!=null) 
                        i = shapes.length
                }

                currentParentCont.state.content = currentParentCont.state.content.filter(shape=> shape.getShape().id != selectedShapeData.currentShape.getShape().id)
 
                selectedShapeData.currentShape.getShape().containerParentId = ''
                selectedShapeData.currentShape.getShape().containerParentDistWidth  = 0;
                selectedShapeData.currentShape.getShape().containerParentDistHeight = 0;

                shapes.push(selectedShapeData.currentShape)
            } 
 
        }else{
            //console.log('rejuste tiene padre',containerFound.state.content, selectedShapeData.currentShape.getShape().id)
            //se encontro un padre
           //console.log( '  encontro', containerFound.state.shape.id, selectedShapeData.currentShape.getShape().containerParentId, selectedShapeData.currentShape.getShape().id )
            if(containerFound.state.content.find(shape=> shape.getShape().id == selectedShapeData.currentShape.getShape().id)){
                //lo contiene entonce que se ajuste
                containerFound.adjustContent()
                    console.log('rejuste')
                //como el padre se pudo haber ajustado, entonces hay que volver a checar el DistWidth y DistHeight
                selectedShapeData.currentShape.getShape().containerParentDistWidth = selectedShapeData.currentShape.getShape().x -containerFound.getShape().x;
                selectedShapeData.currentShape.getShape().containerParentDistHeight = selectedShapeData.currentShape.getShape().y -containerFound.getShape().y;

            }else{
                //es contenedor nuevo
                //si tenia contenedor anteriormente se quita del anterior
                if(selectedShapeData.currentShape.getShape().containerParentId != ''){
                    let currentParentCont
                    console.log('buscando padre->', selectedShapeData.currentShape.getShape().containerParentId)
                    console.log('HIJO->', selectedShapeData.currentShape.getShape().id)
                    for (var i = 0; i < shapes.length; i++) { 
                        console.log('buscando padre-EN >', shapes[i])
                        currentParentCont = shapes[i].findById(selectedShapeData.currentShape.getShape().containerParentId);
                        if(currentParentCont && currentParentCont!=null){
                            i = shapes.length
                        }
                    }  
                    currentParentCont.state.content = currentParentCont.state.content.filter(shape=> shape.getShape().id == selectedShapeData.currentShape.getShape().id)
                   
                }
                //se pone en el nuevo
                selectedShapeData.currentShape.state.shape.containerParentId = containerFound.getShape().id
                selectedShapeData.currentShape.getShape().containerParentDistWidth = selectedShapeData.currentShape.getShape().x -containerFound.getShape().x;
                selectedShapeData.currentShape.getShape().containerParentDistHeight = selectedShapeData.currentShape.getShape().y -containerFound.getShape().y;
                containerFound.state.content.push(selectedShapeData.currentShape)
                containerFound.adjustContent()
            } 
            shapes = shapes.filter(s=>s.state.shape.id != selectedShapeData.currentShape.state.shape.id)
        }      

        let auxselectedShapeData = {...selectedShapeData, moveStarted:false}
        setSelectedShapeData(auxselectedShapeData)            
        setShapes(shapes)

        //ctx.reset();
        ctx.clearRect(0, 0, 1200, 1200);
        draw2D(shapes, auxselectedShapeData)

        console.log('final', shapes)
    }

    const canvasOnDblclick = (event)=>{
        event.preventDefault();
        event.stopPropagation();
    }

    const canvasOnKeyDown = (event)=>{
        event.preventDefault();
        event.stopPropagation();
        console.log(event.keyCode)
        console.log(selectedShapeData, '--', selectedShapeData.currentShape)
        if(event.keyCode == 27){  
            if(selectedShapeData.id != '' && selectedShapeData.currentShape){
                //esc
                console.log(selectedShapeData.currentShape)
                selectedShapeData.currentShape.movingCancel(canvasRefOffScreen.current.getContext('2d'), selectedShapeData.shape)

                let shapesAux = [...shapes]
                setShapes(shapesAux)
                cleanCanvas()
                draw2D(shapesAux,selectedShapeData)
            }
        }else if(event.keyCode == 46){ 
            if(selectedShapeData.id != '' && selectedShapeData.currentShape){
                //remove
                
                let data = {shapes}
                data = selectedShapeData.currentShape.remove(data);
                console.log('e', data)
                setShapes(data.shapes)
                let auxS = newSelectedShapeData();
                setSelectedShapeData(auxS)
                cleanCanvas()
                draw2D(data.shapes, auxS) 
            }
        }

    }

    const  mouseOverElementCursor = (event) =>{
        const BB = canvasRef.current.getBoundingClientRect();
        const mx = event.clientX - BB.left;
        const my = event.clientY - BB.top;
        let auxSelectedShapeData = {id:''};
        for (var i = 0; i < shapes.length; i++) { 
            auxSelectedShapeData = shapes[i].getSelectedByMouseCoordinates(canvasRefOffScreen.current.getContext('2d'), mx, my);
            if(auxSelectedShapeData.id != ''){
                 document.getElementById('canvas').style.cursor = auxSelectedShapeData.mousestyle
                break;
            }
        } 
        if(auxSelectedShapeData.id == '')
            document.getElementById('canvas').style.cursor = 'auto'
    }
   /**-----------------END  MOUSE HANDLER -----------------*/


    //-----------------------------UNDO REDO----------------------

    const addUndoRedoAction = (currentShapes) =>{
        let auxUndoRedo = {...undoRedo};
        auxUndoRedo.list.length = auxUndoRedo.index + 1;
        auxUndoRedo.list.push({id:getNextUniqueId('undoredo_'), shapes:currentShapes.filter(e=>e.cloneElement())})
        auxUndoRedo.index = auxUndoRedo.list.length -1;
        setUndoRedo(auxUndoRedo)
    }

    const applyUndo = (event) =>{
        event.preventDefault();
        event.stopPropagation();
        let auxUndoRedo = {...undoRedo};
        if((auxUndoRedo.index -1) >= 0){
            auxUndoRedo.index = auxUndoRedo.index -1

            let auxS = newSelectedShapeData();
            setSelectedShapeData(auxS)

           // canvasRefOffScreen.getContext('2d').reset();
            draw2D(auxUndoRedo.list[auxUndoRedo.index].shapes, auxS)
            setUndoRedo(auxUndoRedo)

        }else 
         console.log('No se puede undo', auxUndoRedo)
    }

    const applyRedo = (event) =>{
        event.preventDefault();
        event.stopPropagation();
        let auxUndoRedo = {...undoRedo};
        if((auxUndoRedo.index +1) < auxUndoRedo.list.length){
            auxUndoRedo.index++
            setUndoRedo(auxUndoRedo)

            let auxS = newSelectedShapeData();
            setSelectedShapeData(auxS)

          //  canvasRefOffScreen.getContext('2d').reset();
            draw2D(auxUndoRedo.list[auxUndoRedo.index].shapes, auxS)

        }else 
        console.log('No se puede redo')
    }

    const applyUndoElementHandler = (event) =>{
        applyUndo(event);
    }

    const applyRedoElementHandler = (event) =>{
        applyRedo(event);
    }

    //-----------------------------END UNDO REDO----------------------
     
 
    return  {
        undoRedo, setUndoRedo,
        shapes, setShapes,
        selectedShapeData, setSelectedShapeData,
        customShapeCreation, setCustomShapeCreation, 
        newSelectedShapeData,
        draw2D,
        defaultDraw2D,
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
        applyRedoElementHandler,
        cleanCanvas
    }
}