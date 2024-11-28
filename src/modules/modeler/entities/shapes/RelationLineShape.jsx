import { useState } from "react"
import { generateKey, intersectionRectByLine, isPointInLine, isPointInsideRectangle, isPointInsideRectangleByCanvas } from "../../js/canvasScripts"
import { drawArrow } from "../../js/canvasShapeOperations";
import { C_ASYNCHRONOUS_MESSAGE, C_BASE_LINE, C_BASE_RECTANGLE, C_COLUMN_SHAPE, C_DEFAULT_BORDER_MOVE_COLOR, C_DEFAULT_CONNECTION_COLOR, C_RELATION_LINE_SHAPE} from "../../constants/ShapeTypes";

import { newSelectedShapeData } from "../../js/canvasDrawFunction";
import { ConnectorProcessor } from "../../connector/ConnectorProcessor"; 
import { LineShape } from "../../shapes/base/LineShape";


//start/end
export class RelationLineShape extends LineShape{

    constructor(id,sourceId, targetId, arrow, orientation, x1,y1, x2, y2){
        super(id,sourceId, targetId, arrow, orientation, x1,y1, x2, y2);
        this.state = {...this.state}
        this.state.shape.type = C_RELATION_LINE_SHAPE,
        this.state.shape.containerAcceptedType = [],
        this.state.shape.acceptedIncomingType=[C_COLUMN_SHAPE],
        this.state.shape.acceptedOutgoingType=[C_COLUMN_SHAPE]
    }


    getShape(){
        return this.state.shape;
    }

    updateShpe(shape){
        this.state = {
            shape: {...shape},
          };
    }

    cloneElement(){
        let lineShape = new LineShape();
        lineShape.state.shape = structuredClone(this.state.shape) 
        return lineShape;
    }

    process(eventName){
    }


    //---------------------FUNCIONES DE MOVIMIENTO IMPLEMENTADAS POR TODAS LAS FIGURAS----------------- */
    /**
     * Dibujar la figura
     * @param {*} ctx 
     * @param {*} selectedShapeData 
     */
    draw(ctx, selectedShapeData, shapes){
        ctx.beginPath();  
        ctx.fillStyle = 'black'
        ctx.strokeStyle = 'black'
 /*        if(selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted){
            ctx.strokeStyle  =   C_DEFAULT_BORDER_MOVE_COLOR
        }else if(allowContain != null){  
            ctx.strokeStyle  =   C_DEFAULT_CONNECTION_COLOR
        }else{
            ctx.strokeStyle  =   this.state.shape.color
        } */
 
        //creating line from points

        let sourceElem 
        let targetElem 
        for (var i = 0; i < shapes.length; i++) { 
            
            if(!sourceElem || sourceElem == null) 
                sourceElem = shapes[i].findById(this.state.shape.sourceId);
            
            if(!targetElem || targetElem == null) 
                targetElem = shapes[i].findById(this.state.shape.targetId);

            if(sourceElem && sourceElem != null && targetElem && targetElem!= null)
                i = shapes.length
        }

       // console.log(sourceElem, targetElem)
        //intersectionRectByLine(x, width, y, height, px1, py1, px2, py2)

        this.state.shape.points[0].x = sourceElem.getShape().x + sourceElem.getShape().width/2
        this.state.shape.points[0].y = sourceElem.getShape().y + sourceElem.getShape().height/2

        this.state.shape.points[1].x = targetElem.getShape().x + targetElem.getShape().width/2
        this.state.shape.points[1].y = targetElem.getShape().y + targetElem.getShape().height/2

  /*       let point = intersectionRectByLine(
        sourceElem.getShape().x, 
        sourceElem.getShape().width, 
        sourceElem.getShape().y, 
        sourceElem.getShape().height, 
        this.state.shape.points[0].x, 
        this.state.shape.points[0].y, 
        this.state.shape.points[1].x,
        this.state.shape.points[1].y) */

        ctx.moveTo(this.state.shape.points[0].x, this.state.shape.points[0].y)

/*         point = intersectionRectByLine(
        targetElem.getShape().x, 
        targetElem.getShape().width, 
        targetElem.getShape().y, 
        targetElem.getShape().height, 
        this.state.shape.points[0].x, 
        this.state.shape.points[0].y, 
        this.state.shape.points[1].x,
        this.state.shape.points[1].y) */

        ctx.lineTo(this.state.shape.points[1].x, this.state.shape.points[1].y)

        ctx.lineWidth = 1; 
        ctx.stroke(); // Render the path 
        ctx.closePath();
        /* if(this.state.shape.arrow){

            if(this.state.shape.orientation == 'end'){
                drawArrow(ctx, this.state.shape.points[0].x, 
                    this.state.shape.points[0].y, 
                    this.state.shape.points[1].x, 
                    this.state.shape.points[1].y,3, ctx.strokeStyle)
            }else if(this.state.shape.orientation == 'start'){
                drawArrow(ctx, this.state.shape.points[1].x, 
                    this.state.shape.points[1].y, 
                    this.state.shape.points[0].x, 
                    this.state.shape.points[0].y,3, ctx.strokeStyle)
            }
        } */
/*
        if(selectedShapeData.id == this.state.shape.id){
            ctx.fillStyle = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
            ctx.beginPath();
            ctx.fillRect(this.state.shape.points[0].x, this.state.shape.points[0].y-5, 10, 10)  
            ctx.stroke();

            ctx.fillStyle = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
            ctx.beginPath();
            ctx.fillRect(this.state.shape.points[1].x, this.state.shape.points[1].y-5, 10, 10)  
            ctx.stroke();
        }
        ctx.closePath();
 */
    }

    /**
     * Indica que el mouse dejo de moverse, entonces se actualizan
     * las posiciones de las figuras
     * 
     * Verifica si sigue interceptado por los dos execution specification
     * sino, busca si tiene nuevos
     * sino se debe retornar a la posicion anterior
     * @param {*} ctx 
     * @param {*} selectedShapeData 
     * @param {*} shapes 
     * @param {*} mx 
     * @param {*} my 
     */
    movingStopped(ctx, selectedShapeData, shapes, mx, my){
/* 
        //tiene que seguir interceptado 2 sequences specification
        //primero si sigue interceptando a los actuales
        //buscando los elementos sourceId y targetId
        let originalSourceElem;
        let originalTargetElem;
        for (let index = 0; index < shapes.length; index++) {
            const element = shapes[index];
            if(!originalSourceElem)
                originalSourceElem = element.findById(this.state.shape.sourceId);
            if(!originalTargetElem)
                originalTargetElem = element.findById(this.state.shape.targetId);
            if( originalSourceElem && originalTargetElem) index = shapes.length
        }
      
        console.log('original source')
        const isSourcerId = isPointInsideRectangle(
            originalSourceElem.getShape().x, 
            originalSourceElem.getShape().width, 
            originalSourceElem.getShape().y, 
            originalSourceElem.getShape().height,
            this.state.shape.points[0].x,
            this.state.shape.points[0].y)

        console.log('original target')
        const isTargetId = isPointInsideRectangle(
            originalTargetElem.getShape().x, 
            originalTargetElem.getShape().width, 
            originalTargetElem.getShape().y, 
            originalTargetElem.getShape().height,
            this.state.shape.points[1].x,
            this.state.shape.points[1].y)

        if(isSourcerId && isTargetId) return

        console.log(isSourcerId, isTargetId)
        let newSourceElem = null;
        let newTargetElem = null;

        if(!isSourcerId){
            //find new source 
            for (let index = 0; index < shapes.length; index++) {
                newSourceElem = shapes[index].findByCoordinatesAndAcceptanceType(ctx,this.state.shape.points[0].x, this.state.shape.points[0].y, shapes, C_ASYNCHRONOUS_MESSAGE, false, [])
                if(newSourceElem != null) index = shapes.length
            } 
            if(!newSourceElem || newSourceElem == null){
                this.movingCancel(ctx, selectedShapeData.shape ) //selectedShapeData.shape==elemento clonado
                return;
            }
        }
        
        if(!isTargetId){
            //find new target 
            for (let index = 0; index < shapes.length; index++) {
                newTargetElem = shapes[index].findByCoordinatesAndAcceptanceType(ctx,this.state.shape.points[1].x, this.state.shape.points[1].y, shapes, C_ASYNCHRONOUS_MESSAGE, false, [])
                if(newTargetElem != null) index = shapes.length
            }
            console.log('encontro target->', newTargetElem)
            if(!newTargetElem || newTargetElem == null){
                this.movingCancel(ctx, selectedShapeData.shape ) //selectedShapeData.shape==elemento clonado
                return;
            }
        }

        if(!isSourcerId && newSourceElem.getShape().id != originalSourceElem.getShape().id){
            const index = originalSourceElem.getShape().outgoing.indexOf(this.getShape().id); 
            if (index > -1) {
                originalSourceElem.getShape().outgoing.splice(index, 1);
            }
            this.getShape().sourceId = newSourceElem.getShape().id 
            newSourceElem.getShape().outgoing.push(this.getShape().id) 
        }

        if(!isTargetId && newTargetElem.getShape().id != originalTargetElem.getShape().id){
            console.log('hacer la nueva relacion target')
            const index = originalTargetElem.getShape().incoming.indexOf(this.getShape().id);
            if (index > -1) {
                originalTargetElem.getShape().incoming.splice(index, 1);
            } 
            this.getShape().targetId = newTargetElem.getShape().id 
            newTargetElem.getShape().incoming.push(this.getShape().id) 
        } */
    }

    /**
     * Se usa cuando se esta moviendo por el mouse
     * @param {*} selectedShapeData 
     * @param {*} shapes 
     * @param {*} mx 
     * @param {*} my 
     * @returns 
     */
    moveSelected(ctx, selectedShapeData, shapes, mx, my){

        if(selectedShapeData.id != this.state.shape.id) return false;
/*         this.state.shape.points[0].y = my
        this.state.shape.points[1].y = my */
        return true;


        /*        let foundCount = 0
        for (var i = 0; i < shapes.length; i++) { 

            if(shapes[i].getShape().id == this.state.shape.targetId){
                if(my > shapes[i].getShape().verticalLine.y2){
                    shapes[i].getShape().verticalLine.y2 = my + 50 
                }
                foundCount++;
            }
            if(shapes[i].getShape().id == this.state.shape.sourceId){
                if((shapes[i].getShape().y + shapes[i].getShape().height) < my){
                    this.state.shape.points[0].y = my
                    this.state.shape.points[1].y = my
        
                    if(my > shapes[i].getShape().verticalLine.y2){
                        shapes[i].getShape().verticalLine.y2 = my + 200
                    }
                }
                foundCount++;
            }
            if(foundCount==2)break; 
        }*/

    }

    /**
     * Se pretende cancelar el movimiento cuando se toca 
     * la tecla de cancelar
     * @param {*} ctx 
     * @param {*} clonedShape 
     * @returns 
     */
    movingCancel(ctx, clonedShape){ 
        let found = false;
        if(clonedShape.state.shape.id == this.state.shape.id){
            this.state.shape = clonedShape.state.shape; 
            found = true;
        } 
        return found
    }

    /**
     * se utiliza en el canvasOnMouseDown y en 
     * el mouseOverElementCursor, para encontrar cualquier 
     * tipo de figura, sea principal o secundaria
     * @param {*} ctx 
     * @param {*} mx 
     * @param {*} my 
     * @returns 
     */
    getSelectedByMouseCoordinates(ctx, mx, my){  
        let auxSelectedShapeData = newSelectedShapeData();
        auxSelectedShapeData.mousestyle='move';
        auxSelectedShapeData.acceptedIncomingType= this.state.shape.acceptedIncomingType
        auxSelectedShapeData.acceptedOutgoingType=this.state.shape.acceptedOutgoingType

        //{id:'', type:'', subtype:'', mousestyle:'move', acceptedIncomingType: this.state.shape.acceptedIncomingType, acceptedOutgoingType:this.state.shape.acceptedOutgoingType}
   
        if(isPointInLine(ctx, mx, my, this.state.shape.points[0].x, this.state.shape.points[0].y, this.state.shape.points[1].x, this.state.shape.points[1].y)){
            auxSelectedShapeData.id = this.state.shape.id;
           
            //auxSelectedShapeData.index = i;  
            auxSelectedShapeData.type     = this.state.shape.type;
            auxSelectedShapeData.subtype  = '';
            auxSelectedShapeData.position = '';
            auxSelectedShapeData.mx    = mx;
            auxSelectedShapeData.my    = my;
            auxSelectedShapeData.position   = '';
            auxSelectedShapeData.mousestyle = this.state.shape.mousestyle; 
            auxSelectedShapeData.currentShape = this
            auxSelectedShapeData.shape = this.cloneElement()
        }
        return auxSelectedShapeData
    }


    /**
     * Petición de movimiento por parte de un elemento externo.
     * Se usa en la creación de una linea a traves de una clase connector (ExeSpecificationAsynMessageConnector)
     * LifeLineShape utiliza en los metodos:
     * - del ExecutionSpecificationShape.moveRequest
     * - del ExecutionSpecificationShape.movingStopped
     * - del ExecutionSpecificationShape.moveExecutionSpecifications
     * para moverlo.
     *  
     * @param {*} element 
     */
    moveRequest(ctx, element, selectedShapeData, shapes, mx, my){ 
/*         if(element.state.shape.id == this.state.shape.sourceId){
            if(element.state.shape.type == C_BASE_LINE){
                this.state.shape.points[0].y = element.state.shape.verticalLine.x1;
            }else if(element.state.shape.type == C_EXECUTION_SPECIFICATION){
             
                this.state.shape.points[0].y = element.state.shape.y - this.state.shape.relateExeSpecY;
                this.state.shape.points[1].y = this.state.shape.points[0].y;
            }
        }else  if(element.state.shape.id == this.state.shape.targetId){
            if(element.state.shape.type == C_BASE_LINE)
                this.state.shape.points[this.state.shape.points.length-1].x = element.state.shape.verticalLine.x1;
            else if(element.state.shape.type == C_EXECUTION_SPECIFICATION){
                this.state.shape.points[0].y = element.state.shape.y - this.state.shape.relateExeSpecY;
                this.state.shape.points[1].y = this.state.shape.points[0].y;
            }
        } */
    }



    /**
     * Buscar si el id le pertenece o a algún hijo tipo figura principal
     * @param {*} id 
     * @returns 
     */
    findById(id){
        if(this.state.shape.id == id) return this; else return null;
    }

    /**
     * Se utiliza cuando se mueve un elemneto y se quiere saber
     * si queda icluido dentro de otro
     * por inclusiono por contenedor
     * @param {*} mx 
     * @param {*} my 
     * @param {*} shapes  
     * @param {*} incomingType 
     * @returns 
     */
    findByCoordinatesAndAcceptanceType(ctx, mx, my, shapes, incomingType, byContainer, excluded){

        return (isPointInLine(ctx, mx, my, this.state.shape.points[0].x, this.state.shape.points[0].y, this.state.shape.points[1].x, this.state.shape.points[1].y)
         &&
        !byContainer) &&
        this.state.shape.acceptedIncomingType.includes(incomingType)?this: null;
 
    }

    /**
     * se utiliza para eliminar cuaqluier elemento hijo
     * antes de que se elimine a el mimso
     */
    remove(data, parentRequest){
        //buscar su sourceId y targetId quitar el id de sus listas
        let originalSourceElem;
        let originalTargetElem;
        for (let index = 0; index < data.shapes.length; index++) {
            const element = data.shapes[index];
            if(!originalSourceElem)
                originalSourceElem = element.findById(this.state.shape.sourceId);
            if(!originalTargetElem)
                originalTargetElem = element.findById(this.state.shape.targetId);
            if( originalSourceElem && originalTargetElem) index = data.shapes.length
        }

        if(originalSourceElem)
            removeFromList(originalSourceElem, this.getShape().id)
        if(originalTargetElem)
            removeFromList(originalTargetElem, this.getShape().id)

        //se elimina el mismo
        data.shapes = data.shapes.filter(l=> l.getShape().id != this.getShape().id)

        return {shapes:data.shapes}
    }

    //---------------------END FUNCIONES IMPLEMENTADAS POR TODAS LAS FIGURAS----------------- */

    removeFromList(elem, id){
        let index = elem.getShape().incoming.indexOf(id);
        if (index > -1) {
            elem.getShape().incoming.splice(index, 1);
        } 
        index = elem.getShape().outgoing.indexOf(id);
        if (index > -1) {
            elem.getShape().outgoing.splice(index, 1);
        }     
    }
 
}