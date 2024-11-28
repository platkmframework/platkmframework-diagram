import { C_EXECUTION_SPECIFICATION, C_ASYNCHRONOUS_MESSAGE } from "../../constants/ShapeTypes";
import { intersectionRectByLine, isPointInsideRectangle } from "../../js/canvasScripts";


export class ExeSpecificationAsynMessageConnector{

    constructor(){
        this.state = {
            types:[C_EXECUTION_SPECIFICATION, C_ASYNCHRONOUS_MESSAGE],
            classTypeName: 'ExeSpecificationAsynMessageConnector'
        }
    }
    
    isRelation(selectedShapeData, drawingShape){
        return this.state.types.includes(selectedShapeData?.currentShape?.state?.shape?.type) 
    }

    canConnect(ctx, selectedShapeData, drawingShape){
        let asynchMess;
        let exeSpec;
        if(selectedShapeData.currentShape.state.shape.type == C_EXECUTION_SPECIFICATION){
            exeSpec = selectedShapeData.currentShape;
            asynchMess = drawingShape;
        }else{
            exeSpec = drawingShape;
            asynchMess = selectedShapeData.currentShape;
        }

        let containerPoint = null
        if(selectedShapeData.id != drawingShape.state.shape.id &&
                        selectedShapeData.moveStarted &&
                        exeSpec.state.shape.acceptedIncomingType.includes(asynchMess.state.shape.type)){

            if (isPointInsideRectangle( 
                exeSpec.state.shape.x,
                exeSpec.state.shape.width, 
                exeSpec.state.shape.y, 
                exeSpec.state.shape.height,
                asynchMess.state.shape.points[0].x,
                asynchMess.state.shape.points[0].y
                )){
                    containerPoint = selectedShapeData.connections.find(c=>c.position=='init') 
                    if(containerPoint == null){
                        containerPoint = {position: 'init', exeSpecId: exeSpec.state.shape.id, aysnMessId: asynchMess.state.shape.id, classTypeName : this.state.classTypeName}
                        selectedShapeData.connections.push(containerPoint)
                    }else{
                        containerPoint.exeSpecId  = exeSpec.state.shape.id, 
                        containerPoint.aysnMessId = asynchMess.state.shape.id
                    }
                }
                
            if(containerPoint == null && 
                isPointInsideRectangle(
                    exeSpec.state.shape.x,
                    exeSpec.state.shape.width, 
                    exeSpec.state.shape.y, 
                    exeSpec.state.shape.height,
                    asynchMess.state.shape.points[1].x,
                    asynchMess.state.shape.points[1].y 
                    )){
                        containerPoint = selectedShapeData.connections.find(c=>c.position=='end') 
                        if(containerPoint == null){
                            containerPoint = {position: 'end', exeSpecId: exeSpec.state.shape.id, aysnMessId: asynchMess.state.shape.id, classTypeName : this.state.classTypeName}
                            selectedShapeData.connections.push(containerPoint)
                        }else{
                            containerPoint.exeSpecId  = exeSpec.state.shape.id, 
                            containerPoint.aysnMessId = asynchMess.state.shape.id
                        }
                    }
            
            if(containerPoint == null)
                //borra si no estoy
                selectedShapeData.connections.filter(c=> c.exeSpecId != exeSpec.state.shape.id  && c.aysnMessId != asynchMess.state.shape.id)
            
        }
        return containerPoint;

    }


    finishProcess(ctx, selectedShapeData, shapes, list){
        list.map(cp=>{
            let asynMess = shapes.find(s=> s.state.shape.id == cp.aysnMessId)
            let exeSpec  = this.findById(shapes, cp.exeSpecId);
            let oldShape;
            if(cp.position == 'end'){
                if(asynMess.state.shape.targetId != exeSpec.state.shape.id){
                    const oldShape = this.findById(shapes, asynMess.state.shape.targetId);
                    oldShape.state.shape.incoming = oldShape.state.shape.incoming.filter(v=> v != asynMess.state.shape.id)
                    asynMess.state.shape.targetId = exeSpec.state.shape.id
                    exeSpec.state.shape.incoming.push(asynMess.state.shape.id)
                    asynMess.state.shape.relateExeSpecY = exeSpec.state.shape.y - asynMess.state.shape.points[0].y; 
                   
                    asynMess.moveRequest(ctx, exeSpec, selectedShapeData, shapes, null, null)

                }
            }else if(cp.position == 'init'){
                if(asynMess.state.shape.sourceId != exeSpec.state.shape.id){
                    const oldShape =  this.findById(shapes, asynMess.state.shape.sourceId);
                    oldShape.state.shape.outgoing = oldShape.state.shape.outgoing.filter(v=> v != asynMess.state.shape.id)
                    asynMess.state.shape.sourceId = exeSpec.state.shape.id
                    exeSpec.state.shape.outgoing.push(asynMess.state.shape.id)
                    asynMess.state.shape.relateExeSpecY = exeSpec.state.shape.y - asynMess.state.shape.points[0].y; 
           
                    asynMess.moveRequest(ctx, exeSpec, selectedShapeData, shapes, null, null)
                }
            }
        })
    }

    findById(list, id){
        let element
        for (let index = 0; index < list.length; index++) {
            element = list[index].findById(id);
            if(element != null) return element;
        }
        return null;
    }



}