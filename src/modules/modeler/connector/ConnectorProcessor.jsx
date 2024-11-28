export class ConnectorProcessor{

    process=(ctx, connectors, selectedShapeData, drawingShape)=>{
        let containerPoint = null;
 
        if(selectedShapeData.currentShape && selectedShapeData.currentShape.state.shape.id != drawingShape?.state?.shape?.id && selectedShapeData.moveStarted)
            for (let index = 0; index < connectors.length; index++) {
                if(selectedShapeData.moveStarted && connectors[index].isRelation(selectedShapeData, drawingShape))
                    containerPoint = connectors[index].canConnect(ctx, selectedShapeData, drawingShape);
                if(containerPoint != null) return containerPoint;
            }
            
        return containerPoint;
    }

    finishProcess(ctx, connectors, selectedShapeData, shapes, flowLines){
        let list;
        for (let index = 0; index < connectors.length; index++) {
            list = selectedShapeData.connections.filter(c=> c.classTypeName == connectors[index].state.classTypeName);
            connectors[index].finishProcess(ctx, selectedShapeData, shapes, flowLines, list)
        }
    }
}