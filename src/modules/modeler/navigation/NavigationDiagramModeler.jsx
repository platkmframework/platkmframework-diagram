import { Button } from "@mui/material";
import { createRef, useEffect, useRef, useState } from "react"

import { generateKey } from "../js/canvasScripts";
import { drawShapeLineIntersection, drawIntersectionForSourceAndTargetElement} from "../js/canvasShapeOperations";

import { v4 as uuidv4   } from 'uuid';

const C_LINE_TO_SPLIT   = "LINE_TO_SPLIT";
const C_MOVING_POINT    = "MOVING_POINT";
const C_CREATE_NEW_LINE = "CREATE_NEW_LINE";

export const NavigationDiagramModeler = () =>{

    const canvasRef = useRef(null);
    const [viewComponentCount, setViewComponentCount] = useState(-1) 

    const [undoRedo, setUndoRedo] = useState({list:[], index:-1})

    const newShape= {id:'', x:770, y:60, height:80, width:250, type:'rect', label:'', name:'', color:'#cfe2ff',
        edges:[
            {x:770-5, y:60-5, height:10, width:10, type:'left_top'},
            {x:770 + 250-5, y:60-5, height:10, width:10, type:'right_top'},
            {x:770-5, y:60 + 80 -5, height:10, width:10, type:'left_bottom'},
            {x:770 + 250-5, y:60 + 80 -5, height:10, width:10, type:'right_bottom'},
        ],
        incoming:[],
        outgoing:[],
        properties:{id:'', label:'Navigation Component', type:'NavComponent', menuPath:'', fileName:'', role:''}
    }

    /*    
    const [shapes, setShapes] = useState([{id:generateKey('shape_'), x:770, y:60, height:80, width:250, type:'rect', label:'', name:'', color:'#cfe2ff', 
           edges:[
               {x:770-5, y:60-5, height:10, width:10, type:'left_top'},
               {x:770 + 50-5, y:60-5, height:10, width:10, type:'right_top'},
               {x:770-5, y:60 + 50 -5, height:10, width:10, type:'left_bottom'},
               {x:770 + 50-5, y:60 + 50 -5, height:10, width:10, type:'right_bottom'},
           ],
           incoming:[],
           outgoing:[]
       }]) 
       */
    const [shapes, setShapes] = useState([]) 

    //[{id:'', sourceId:'', targetId:'', points:[{id:'', x:'', y:''}], properties:{}}]
    const [flowLines, setFlowLines] = useState([])

    const [movingAction, setMovingAction] = useState({index:-1, started:false, borderType:'', mx:0, my:0});
    const [labelEditorDisplayed, setLabelEditorDisplayed] = useState(false);
    const [indexElementSelected, setIndexElementSelected] = useState(1);

    //CUSTOM PROCESS IN MOVING PROCESS
    const [activatedProcess, setActivatedProcess] = useState(''); //LINE_TO_SPLIT, MOVING_POINT, START_NEW_LINE

    //-- to start new line creation 
    const [startLinePoint, setStartLinePoint] = useState({x:0,y:0, incomingIndex:-1, startLine:false});

    //--split line
    const [lineToSplit, setLineToSplit] = useState({lineId:'', pointId:'', newPointId:'', mx:0, my:0, moveStarted:false});

    //--moving point
    //const [pointToMove, setPointToMove] = useState({lineId:'', pointId:''});

    // END CUSTOM PROCESS IN MOVING PROCESS

    //--selected element
    const [selectedShapeData, setSelectedShapeData] = useState({index:-1, id:'', type:'', mx:'', my:'', moveStarted:false, pointId:'', newPointId:'', borderType:''});

    useEffect(()=>{
        //init drawing
       // canvasRef.current.addEventListener("dblclick", (event) => {canvasOnDblclick(event, shapes, flowLines)});
       addUndoRedoAction([...shapes],[...flowLines])
        draw2D(shapes, flowLines, selectedShapeData)
    }, [])

    //-----------------------------main functions------------------------
    /*    
        const draw2D=(shapeList, flowLinesList)=>{ 
            draw2DWithSelected(shapeList, flowLinesList, null);
        } 
    */

    // new json or dat hooks
    const newSelectedShapeData=()=>{return {index:-1, id:'', type:'',mx:'', my:'', moveStarted:false, pointId:'', newPointId:'', borderType:''}}

    const newStartLinePoint =()=>{return {x:0,y:0, incomingIndex:-1, startLine:false}}

    const getNextUniqueId = (prefix)=>{ 
        return generateKey(prefix);
    }

    const draw2D=(shapeList, flowLinesList, selectedShapeData)=>{      
        // console.log(flowLinesList)
        if(canvasRef.current){
            const ctx = canvasRef.current.getContext('2d') 

            let lineSelected = null;
            flowLinesList.map(line=>{
                ctx.beginPath();
                ctx.strokeStyle  = 'black';
                //creating line from points
                line.points.map((p,i)=>{
                    if(i==0){ 
                        ctx.moveTo(p.x, p.y);  
                    }else{
                        ctx.lineTo(p.x, p.y);  
                                    
                        //circle on lines union when selected
                        if(selectedShapeData.id == line.id){
                            if(i < line.points.length-1){
                                let path1 = new Path2D();
                                path1.arc(p.x, p.y, 5, 0, 2 * Math.PI);
                                ctx.fill(path1);
                                ctx.stroke(path1);
                            }
                            lineSelected = line;
                        }
                    }
                })    
                ctx.lineWidth = 2; 
                ctx.stroke(); // Render the path 
            })

            if(lineSelected != null){
                let shapeSource = shapeList.find((s)=> s.id == lineSelected.sourceId);
                let shapeTarget = shapeList.find((s)=> s.id == lineSelected.targetId);

                //console.log(shapeSource, shapeTarget)
                drawIntersectionForSourceAndTargetElement(ctx, shapeSource, shapeTarget, lineSelected)
            }

            let shapeSelected = null;

            shapeList.map(r=>{
                ctx.beginPath();
                ctx.fillStyle   = r.color;
                ctx.strokeStyle = r.color;
                ctx.roundRect(r.x, r.y, r.width, r.height, 5)
                //const a = new Path2D()
                //a.rect(r.x, r.y, r.width, r.height)  
                ctx.fill()
                ctx.stroke() 

                ctx.beginPath();
                ctx.fillStyle  = 'black';
                ctx.font = "20px Arial";  //serif
                ctx.textAlign = "left";
                ctx.fillText(r.properties.label, r.x, r.y-5);
                ctx.stroke();
                
                if(selectedShapeData.id == r.id){
                    shapeSelected = r;
                    r.edges.map(re=>{
                        ctx.fillStyle = "black";
                        ctx.beginPath();
                        ctx.fillRect(re.x, re.y, re.width, re.height)  
                        ctx.stroke();
                    })
                }
            })  

            if(shapeSelected != null){
                drawShapeLineIntersection(ctx, shapeSelected, shapes, flowLines)
            }
        }
    }

    /**
     * 
     * @param {*} clientX 
     * @param {*} clientY 
     * @returns 
     */

    const getMainElementIndexSelected = (clientX, clientY, updateSelection)=>{
        return getMainElementIndexSelectedByShapes(clientX, clientY, updateSelection, shapes, flowLines)

    }

    const getMainElementIndexSelectedByShapes = (clientX, clientY, updateSelection, currentShapes, currentFlowLines)=>{
        if(!canvasRef.current) return -1;  
        const BB = canvasRef.current.getBoundingClientRect();
        const mx = clientX - BB.left;
        const my = clientY - BB.top;
        let auxSelectedShapeData = newSelectedShapeData()
       // console.log('---------->', currentShapes)
        currentShapes.map((r,i)=>{  
            if(mx>=r.x && mx<=r.x+r.width && my>=r.y && my<=r.y+r.height){
                auxSelectedShapeData.id    = r.id;
                auxSelectedShapeData.index = i;  
                auxSelectedShapeData.type  = r.type;
                auxSelectedShapeData.mx    = mx - r.x;
                auxSelectedShapeData.my    = my - r.y;
            }else{
                r.edges.map((ed,j)=>{
                    if(mx >= ed.x && mx <= ed.x + ed.width && my >= ed.y && my <= ed.y + ed.height){
                        auxSelectedShapeData.id    = r.id;
                        auxSelectedShapeData.index = i 
                        auxSelectedShapeData.type  = r.type;   
                        auxSelectedShapeData.borderType = ed.type;
                        auxSelectedShapeData.mx = mx - r.x;
                        auxSelectedShapeData.my = my - r.y;
                    }
                })
            }
        })

        if(auxSelectedShapeData.id == ''){
            auxSelectedShapeData = checkLineClickedByMouse(auxSelectedShapeData, mx, my, updateSelection, currentFlowLines)
        }

        if(updateSelection)
            setSelectedShapeData(auxSelectedShapeData)
        return auxSelectedShapeData;
    }

    const checkLineClickedByMouse = (selShapeData, mx, my, updateSelection, currentFlowLines)=>{
        
        if(!canvasRef.current) return -1; 
        const ctx = canvasRef.current.getContext('2d')

        let path;
        let point1 = {x:0, y:0}
        let point2 = {x:0, y:0}
        for (let i = 0; i < flowLines.length; i++) {
            point1 = null
            point2 = null
            for (let j = 0; j < currentFlowLines[i].points.length; j++) {
                if(point1 == null){
                    point1 = currentFlowLines[i].points[j]
                }else if(point2 == null){
                    point2 = currentFlowLines[i].points[j] 
                    if( j < currentFlowLines[i].points.length-1){
                        selShapeData = checkPointInLineUnion(selShapeData, currentFlowLines[i].id, ctx, point2, mx, my, updateSelection);
                        if(selShapeData.id != ''){
                            selShapeData.index = i;
                            j = currentFlowLines[i].points.length; 
                        }
                    } 
                    selShapeData = check2PointInLine(selShapeData, currentFlowLines[i].id, ctx, point1, point2, mx, my, updateSelection)
                    if(selShapeData.id != ''){
                        j = currentFlowLines[i].points.length;
                        selShapeData.index = i;
                    }else{
                        point1 = point2;
                        point2 = null
                    }
                }
            }
            if(selShapeData.id != ''){
                i = currentFlowLines.length;
            }
        } 
        return selShapeData;
    }

    /**
     * 
     * @param {*} selShapeData 
     * @param {*} lineId 
     * @param {*} ctx 
     * @param {*} point 
     * @param {*} mx 
     * @param {*} my 
     * @returns 
     */
    const checkPointInLineUnion = (selShapeData, lineId, ctx, point, mx, my, updateSelection)=>{

       // console.log('checking point -->', point, 'mouse',mx, my )
        const circle = new Path2D();
        circle.arc(point.x, point.y, 5, 0, 2 * Math.PI); 
        if(ctx.isPointInPath(circle, mx, my)){
            selShapeData.id = lineId;
            selShapeData.pointId = point.id;
            selShapeData.type = 'line'
            selShapeData.borderType = 'point_union'
            selShapeData.mx = mx
            selShapeData.mx = my
            //console.log('encontró---punto intermedio-------')

            if(updateSelection)
                setActivatedProcess(C_MOVING_POINT)
        }
        return selShapeData

    }

    const check2PointInLine = (selShapeData, lineId, ctx, point1, point2, mx, my, updateSelection)=>{ 
        //console.log(point1, point2)
        const path = new Path2D();
        path.lineTo(point1.x, point1.y);
        path.lineTo(point2.x, point2.y);
        ctx.lineWidth = 5;
        if(ctx.isPointInStroke(path, mx, my)){  
            if(updateSelection){
                setActivatedProcess(C_LINE_TO_SPLIT)
                setLineToSplit({...lineToSplit, moveStarted:false, newPointId:'',  lineId:lineId, pointId:point1.id, mx:mx, my:my});
            }
            selShapeData.id = lineId;
            selShapeData.pointId = point1.id; 
            selShapeData.type = 'line'
            selShapeData.borderType = 'point_line'
            selShapeData.newPointId = ''
            selShapeData.moveStarted=false
            selShapeData.mx = mx
            selShapeData.mx = my
            //console.log('encontró----------')
        }
        return selShapeData
    }
// END search for element selected

    //----------------------------- END main functions-------



    //-----------------dblclick-----------------------
    function addInput(indexElementSelected, x, y) {

        var input = document.createElement('input');
    
        input.type = 'text';
        input.style.position = 'fixed';
        input.style.left = (x - 4) + 'px';
        //input.style.left =  shapes[indexElementSelected].x  + 'px';
        input.style.top = (y - 4) + 'px';
        input.id='labelEditor'
        input.name='labelEditor'
        input.onkeydown = handleEnter;
        input.focusout = (event) => {
            // console.log(333)
     /*       var elem = document.getElementById('labelEditor');
            if(elem){
                elem.remove();
            }
            setLabelEditorDisplayed(false)   */
        };
       
        document.body.appendChild(input);
        input.focus();
       
    }

    function handleEnter(event) { 

        if (event.keyCode === 13) { 
            //drawText(this.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));
            var elem = document.getElementById('labelEditor');
            elem.blur();
            document.body.removeChild(elem);
            elem.remove();
            setLabelEditorDisplayed(false);
            
            if(canvasRef.current){ 
                const ctx = canvasRef.current.getContext('2d')
                ctx.reset();
                draw2D(shapes, flowLines, selectedShapeData)
            }
            
        }
    }
    //----------------end dblclick--------------------

    const  mouseOverElementCursor = (event) =>{
        //console.log('mouseOverElementCursor')
        const elementSelected = getMainElementIndexSelected(event.clientX, event.clientY, false)
        if(elementSelected.type == 'rect'){ 
            if(elementSelected.borderType == "right_bottom"){
                document.getElementById('canvas').style.cursor = 'pointer'
            }else  document.getElementById('canvas').style.cursor = 'move'
        }else if(elementSelected.type == 'line'){

            if(elementSelected.borderType == 'point_union'){
                 document.getElementById('canvas').style.cursor = 'pointer'
            }else{
                document.getElementById('canvas').style.cursor = 'move'
            }

        }else{
            document.getElementById('canvas').style.cursor = 'auto'
        }
    }

    const canvasOnMouseMove = (event)=>{
        event.preventDefault();
        event.stopPropagation(); 

        (async () => {
            mouseOverElementCursor(event)
        })();

        if(activatedProcess == C_CREATE_NEW_LINE){

            if(startLinePoint.startLine && startLinePoint.incomingIndex >=0){
                // console.log('canvasOnMouseMove' + 0)
                if(canvasRef.current){   
                    const ctx = canvasRef.current.getContext('2d')
                    ctx.reset();

                    const BB = canvasRef.current.getBoundingClientRect();
                    const mx = event.clientX - BB.left;
                    const my = event.clientY - BB.top;

                    ctx.moveTo(startLinePoint.x, startLinePoint.y); // Move the pen to (30, 50)
                    ctx.lineTo(mx, my); // Draw a line to (150, 100)
                    ctx.stroke(); // Render the path

                    draw2D(shapes, flowLines, selectedShapeData)
                }
                 //startLinePoint
            }
        }else if(activatedProcess == C_LINE_TO_SPLIT){
            //console.log('canvasOnMouseMove' + 3)
            const ctx = canvasRef.current.getContext('2d')
            ctx.reset();

            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;

            if(!lineToSplit.moveStarted){
               // console.log('start moving') 
                let auxFlowLines = [...flowLines];
                //console.log(auxFlowLines)
                let newPointId = getNextUniqueId('point_')
                auxFlowLines = auxFlowLines.map(line=>{
                    if(line.id == lineToSplit.lineId){  
                        //  console.log('cantidad puntos inicial', line.points)
                        let pointIdIndex = line.points.map(p=> p.id).indexOf(lineToSplit.pointId); 
                        line.points.splice(pointIdIndex+1, 0, {id: newPointId, x:lineToSplit.mx, y: lineToSplit.my});
                        //  console.log('cantidad puntos final',pointIdIndex, line.points)
                    }
                    return line;
                }) 
                setFlowLines(auxFlowLines)
                setLineToSplit({...lineToSplit,moveStarted:true,  pointId:'', newPointId:newPointId, mx:0, my:0});  
                draw2D(shapes, auxFlowLines, selectedShapeData) 

              //  console.log('start moving',auxFlowLines) 
            }else{
                let auxFlowLines = [...flowLines];
                //console.log(lineToSplit, auxFlowLines)
                auxFlowLines = auxFlowLines.map(line=>{
                    //console.log(line.id ,lineToSplit.lineId)
                    if(line.id == lineToSplit.lineId){  
                        // console.log('1', line.points)
                        line.points.map(p=>{
                                if(p.id == lineToSplit.newPointId){
                                p.x = mx;
                                p.y = my;
                            }  
                            return p                        
                        }) 
                    }
                    return line;
                }) 
                setFlowLines(auxFlowLines)
                //console.log('moving...',auxFlowLines) 
                draw2D(shapes, auxFlowLines, selectedShapeData)
            }
                
        }else if(activatedProcess == C_MOVING_POINT){

           //  console.log('canvasOnMouseMove' + 4)
            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;

            let auxFlowLines = [...flowLines];
            auxFlowLines = auxFlowLines.map(line=>{
                if(line.id == selectedShapeData.id){  
                    //  console.log('1', line.points)
                    line.points.map(p=>{
                            if(p.id == selectedShapeData.pointId){
                            p.x = mx;
                            p.y = my;
                        }  
                        return p                        
                    }) 
                }
                return line;
            }) 
            setFlowLines(auxFlowLines)
            canvasRef.current.getContext('2d').reset();
            draw2D(shapes, auxFlowLines, selectedShapeData)
        }else if (selectedShapeData.id != '' && selectedShapeData.moveStarted){

          //  console.log('moviendose')
            const ctx = canvasRef.current.getContext('2d')
            ctx.reset();

            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;

            let shapesAux = [...shapes]

            if(selectedShapeData.type == 'rect'){
                
                if(selectedShapeData.borderType == ''){ 

                    shapesAux[selectedShapeData.index].x = mx - selectedShapeData.mx
                    shapesAux[selectedShapeData.index].y = my - selectedShapeData.my
                
                }else{

                    shapesAux[selectedShapeData.index].edges = shapesAux[selectedShapeData.index].edges.filter(re=>{

                        if(selectedShapeData.borderType == re.type && re.type == 'left_top'){
                            if((shapesAux[selectedShapeData.index].width + shapesAux[selectedShapeData.index].x - mx) >= 50){
                                shapesAux[selectedShapeData.index].width =  shapesAux[selectedShapeData.index].width + shapesAux[selectedShapeData.index].x - mx;
                                shapesAux[selectedShapeData.index].x = mx;
                            }
                        }else if(selectedShapeData.borderType == re.type && re.type == 'right_top'){
                            if((mx - shapesAux[selectedShapeData.index].x) >= 50){
                                shapesAux[selectedShapeData.index].width = mx - shapesAux[selectedShapeData.index].x;
                            }
                        }else if(selectedShapeData.borderType == re.type && re.type == 'left_bottom'){
                            if((shapesAux[selectedShapeData.index].width + shapesAux[selectedShapeData.index].x - mx) >= 50){
                                shapesAux[selectedShapeData.index].width =  shapesAux[selectedShapeData.index].width + shapesAux[selectedShapeData.index].x - mx;
                                shapesAux[selectedShapeData.index].x     = mx; 
                            }
                        }else if(selectedShapeData.borderType == re.type && re.type == 'right_bottom'){ 
                            if((mx - shapesAux[selectedShapeData.index].x) >= 50){
                                shapesAux[selectedShapeData.index].width = mx - shapesAux[selectedShapeData.index].x;
                            }
                        }
                        return re;
                    })
                        
                }
                moveEdges(shapesAux[selectedShapeData.index])
                movingIncomingLines(shapesAux[selectedShapeData.index])
                setShapes(shapesAux)

                draw2D(shapesAux, flowLines, selectedShapeData)

            }
            else if(selectedShapeData.type == 'line'){

                //console.log('moving line', selectedShapeData)
                draw2D(shapesAux, flowLines, selectedShapeData)

                if(selectedShapeData.borderType == 'point_line'){

                }else if(selectedShapeData.borderType == 'point_union'){

                }
            }
        }
    }

    const movingIncomingLines = (shape)=>{
        let auxflowLines = [...flowLines]

        const cx = shape.x + (shape.width/2)
        const cy = shape.y + (shape.height/2)

        shape.incoming.map(ikey=>{
            auxflowLines = auxflowLines.map((line)=>{
                if(line.id == ikey){
                    line.points[line.points.length-1].x = cx         
                    line.points[line.points.length-1].y = cy  
                }
                return line
            })
        })

        shape.outgoing.map(ikey=>{
            auxflowLines = auxflowLines.map((line)=>{
                if(line.id == ikey){
                    line.points[0].x = cx         
                    line.points[0].y = cy  
                }
                return line
            })
        })

        setFlowLines(auxflowLines)
    }

    const moveEdges = (shape)=>{
        //console.log(edgesList, edgesIndex)
         shape = shape.edges.filter(re=>{
            if(re.type == 'left_top'){
                re.x = shape.x-5
                re.y = shape.y-5
                re.height = 10
                re.width  = 10  
            }else if(re.type == 'right_top'){
                re.x = shape.x + shape.width -5
                re.y = shape.y-5
                re.height = 10
                re.width  = 10  
            }else if(re.type == 'left_bottom'){
                re.x = shape.x -5
                re.y = shape.y + shape.height -5
                re.height = 10
                re.width  = 10  
            }else if(re.type == 'right_bottom'){
                re.x = shape.x + shape.width -5
                re.y = shape.y + shape.height -5
                re.height = 10
                re.width  = 10  
            }
            return re;
        })
    }

    /**
     * 
     * @param {*} event 
     */
    const canvasOnMouseDown = (event)=>{
        event.preventDefault();
        event.stopPropagation(); 
        
        const elementSelected = getMainElementIndexSelected(event.clientX, event.clientY, true)
       // console.log('canvasOnMouseDown', elementSelected)
        if(activatedProcess == C_CREATE_NEW_LINE){ 
            //console.log('comenzado una linea??')
            //aqui se debe checar el tipo de linea y el objeto selecciando, para 
            //saber si se puede comenzar la relación.
            //Por defecto, pregunta por rect
            if(elementSelected.index >- 1 && elementSelected.type == 'rect'){
                const BB = canvasRef.current.getBoundingClientRect();
                const mx = event.clientX - BB.left;
                const my = event.clientY - BB.top;
                if(startLinePoint.incomingIndex < 0){
                    // console.log('start line')
                    setStartLinePoint({...startLinePoint, x:mx, y:my, incomingIndex:elementSelected.index})
                    draw2D(shapes, flowLines, selectedShapeData);
                }else if(startLinePoint.incomingIndex == elementSelected.index){
                    // console.log('reset it´s the same')
                    resetLineCreation();
                    draw2D(shapes, flowLines, selectedShapeData);
                }else{  
                    // console.log('create line')
                    let auxflowLines = [...flowLines];

                    let sourceElem = shapes[startLinePoint.incomingIndex]
                    let targetElem = shapes[elementSelected.index]
 
                    // ctx.moveTo(sourceElem.x + (sourceElem.width/2), sourceElem.y + (sourceElem.height/2));  

                    const lineId = getNextUniqueId('line_')
                    auxflowLines.push({
                        id: lineId, 
                        sourceId: sourceElem.id, 
                        targetId: targetElem.id, 
                        properties:{},
                        points:[
                            {id: getNextUniqueId('point_'), x: sourceElem.x + (sourceElem.width/2), y: sourceElem.y + (sourceElem.height/2)},
                            {id: getNextUniqueId('point_'), x: targetElem.x + (targetElem.width/2), y: targetElem.y + (targetElem.height/2)},
                        ]});

                    //[{id:'', sourceId:'', targetId:'', points:[{x:'', y:''}]}]
                    //const [flowLines, setFlowLines] = useState([])
                    setFlowLines(auxflowLines)

                    let auxshapes = [...shapes]
                    auxshapes = auxshapes.map((s)=>{
                        if(s.id == sourceElem.id){
                            s.outgoing.push(lineId) 
                        }else if(s.id == targetElem.id){
                            s.incoming.push(lineId) 
                        }
                        return s;
                    })
                    setShapes(auxshapes)
                    // console.log(auxflowLines)
                    // console.log(auxshapes)

                    resetLineCreation()
                    let auxS = newSelectedShapeData();
                    setSelectedShapeData(auxS)
                    canvasRef.current.getContext('2d').reset()
                    draw2D(auxshapes, auxflowLines, auxS)
                   // console.log('terminó de crear la imagen', auxshapes)

                   addUndoRedoAction(auxshapes, auxflowLines)

                }
                
            }else{
                console.log('aun no pinta -- ')
                draw2D(shapes, flowLines, selectedShapeData);

            }
        }else if(elementSelected.id != ''){  
            //listo para mover el elemento seleccionado
            const aux = {...elementSelected, moveStarted:true};
            setSelectedShapeData(aux)
            //console.log('selected ---', aux)
            
            canvasRef.current.getContext('2d').reset()
            draw2D(shapes, flowLines, aux);
        }else{
           // console.log(5555555555555)
            let auxS = newSelectedShapeData();
            setSelectedShapeData(auxS)
            canvasRef.current.getContext('2d').reset()
            draw2D(shapes, flowLines, auxS);
        }  
    }

    

    const canvasOnMouseUp = (event)=>{
        event.preventDefault();
        event.stopPropagation(); 
        draw2D(shapes, flowLines, selectedShapeData)
        if(activatedProcess == C_CREATE_NEW_LINE){
           // console.log('canvasOnMouseUp', startLine)

        }else if( movingAction.index > -1 && movingAction.started){
           // console.log(111)
                
            if(movingAction.borderType == ''){ 
                const ctx = canvasRef.current.getContext('2d')
                ctx.reset();

                const BB = canvasRef.current.getBoundingClientRect();
                const mx = event.clientX - BB.left;
                const my = event.clientY - BB.top;

                let shapesAux = [...shapes]
                shapesAux[movingAction.index].x = mx - movingAction.mx
                shapesAux[movingAction.index].y = my - movingAction.my
                setShapes(shapesAux)

                draw2D(shapesAux, flowLines, selectedShapeData)
            }else{
                //  console.log('not started', movingAction.borderType)
            }
            /*                 shapesAux.map(r=>{
                const a = new Path2D()
                a.rect(r.x, r.y, r.height, r.width) 
                ctx.stroke(a) 
            })   */
            
        }else if(activatedProcess == C_LINE_TO_SPLIT){
             console.log(C_LINE_TO_SPLIT)
           // console.log('encontró terminado')
            setLineToSplit({lineId:'', pointId:'', newPointId:'', mx:0, my:0, moveStarted:false});
            setActivatedProcess('')

            addUndoRedoAction([...shapes], [...flowLines])

        }else if(activatedProcess == C_MOVING_POINT){
            // console.log('encontró circle terminado ')
            // console.log(3333)
            //ELIMINAR PUNTO QUE SE ENCUENTRA EN EL MEDIO DE DOS PARALELOS
            //ELIMINAR PUNTOS SIGUIENTES QUE SE CRUZAN

 
            let auxFlowLines = [...flowLines];
            const ctx = canvasRef.current.getContext('2d')
            ctx.reset();

            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;

            auxFlowLines = auxFlowLines.map(line=>{
                if(line.id == selectedShapeData.lineId){  
                    //  console.log('1', line.points)
                    let indexToRemove = -1;

                    line.points.forEach((p,i)=>{
                        if(p.id == selectedShapeData.pointId){
                            let path = new Path2D();
                            path.lineTo(line.points[i-1].x, line.points[i-1].y);
                            path.lineTo(line.points[i+1].x, line.points[i+1].y);
                            ctx.lineWidth = 5;
                            if(ctx.isPointInStroke(path, mx, my)){  
                                indexToRemove = i
                            }
                        }                         
                    }) 
                    if(indexToRemove >-1){
                        line.points.splice(indexToRemove, 1);
                    }
                }
                return line;
            })

            draw2D(shapes, auxFlowLines, selectedShapeData)
            setFlowLines(auxFlowLines)  
            setActivatedProcess('')
            console.log(999)
            addUndoRedoAction([...shapes], auxFlowLines)


        }else if(selectedShapeData.id != ''){
           // console.log('cambiando el moving a false')
            //keep selected but move any more
             //console.log('stop moving', selectedShapeData)
            setSelectedShapeData({...selectedShapeData, moveStarted:false})

        }
        //console.log(lineToSplit)
        //setMovingAction({...movingAction,index: -1, started:false, borderType:'', mx:0, my:0})
        // console.log('stop moving ddddddd', shapes)
    }

    const addNaveElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();
        
        let auxNewShape = {...newShape}
        auxNewShape.id = uuidv4();
        //console.log(auxNewShape.id )
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

    const navStartLineElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();

        let auxStartLine = newStartLinePoint();
        auxStartLine.startLine = !startLinePoint.startLine
        setStartLinePoint(auxStartLine)
        if(auxStartLine.startLine)
            setActivatedProcess(C_CREATE_NEW_LINE)
    }

    const addNavHandElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();

        resetLineCreation() 
    }

    const removeSelectedElementHandler = (event)=>{
        event.preventDefault();
        event.stopPropagation();

        if(selectedShapeData.id != ''){
            if(selectedShapeData.borderType == 'point_union'){
                console.log(selectedShapeData.borderType)

                let auxflowLines = [...flowLines]
                auxflowLines.map((line)=>{
                    line.points = line.points.filter((p)=>p.id != selectedShapeData.pointId);
                    return line
                })
                //console.log('canvasOnDblclick', auxflowLines)
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

        let auxFlowLines = [...flowLines]
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
        console.log(auxShapes, auxFlowLines)
        addUndoRedoAction(auxShapes, auxFlowLines)
        canvasRef.current.getContext('2d').reset();
        draw2D(auxShapes, auxFlowLines, auxSelectedElem)

    }

    const canvasOnDblclick = (event)=>{
        event.preventDefault();
        event.stopPropagation();
         
        const elementSelected = getMainElementIndexSelectedByShapes(event.clientX, event.clientY, false, shapes, flowLines)
         // console.log(99999999999999, elementSelected.pointId)
         //removing line point
        if(elementSelected?.borderType == 'point_union'){
            let auxflowLines = [...flowLines]
            auxflowLines.map((line)=>{
                line.points = line.points.filter((p)=>p.id != elementSelected.pointId);
                return line
            })
            //console.log('canvasOnDblclick', auxflowLines)
            canvasRef.current.getContext('2d').reset();
            setFlowLines(auxflowLines)
            draw2D(shapes, auxflowLines, selectedShapeData)

            addUndoRedoAction([...shapes], auxflowLines)
        }  
    } 

    const resetLineCreation = ()=>{
        setActivatedProcess('')
        setStartLinePoint(newStartLinePoint())
        canvasRef.current.getContext('2d').reset();
        draw2D(shapes, flowLines, selectedShapeData)
    }


    //-----------------------------UNDO REDO----------------------

    const addUndoRedoAction = (currentShapes, flowLineList) =>{
        let auxUndoRedo = {...undoRedo};
        auxUndoRedo.list.length = auxUndoRedo.index + 1;
        auxUndoRedo.list.push({id:getNextUniqueId('undoredo_'), shapes:structuredClone(currentShapes), flowLines:structuredClone(flowLineList)}) 
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

            canvasRef.current.getContext('2d').reset();
            draw2D(auxUndoRedo.list[auxUndoRedo.index].shapes, auxUndoRedo.list[auxUndoRedo.index].flowLines, auxS)
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

            canvasRef.current.getContext('2d').reset();
            draw2D(auxUndoRedo.list[auxUndoRedo.index].shapes, auxUndoRedo.list[auxUndoRedo.index].flowLines, auxS)

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

 
    return (<> 
        <div className="alert alert-primary" role="alert">
            <span><Button onClick={(event)=>{addNavHandElementHandler(event)}}>Hand</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Agregar</Button></span>
            <span><Button onClick={(event)=>{navStartLineElementHandler(event)}}>Linea</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Zoom +</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Zoom -</Button></span>
            <span><Button onClick={(event)=>{removeSelectedElementHandler(event)}}>Eliminar</Button></span>
            <span><Button onClick={(event)=>{addNaveElementHandler(event)}}>Recargar</Button></span>
            <span><Button onClick={(event)=>{applyUndoElementHandler(event)}}>Undo</Button></span>
            <span><Button onClick={(event)=>{applyRedoElementHandler(event)}}>Redo</Button></span>
        </div>
        <div>
            <canvas id="canvas"  ref={canvasRef} width="1200" height="1200"  
            onMouseMove={(event)=>canvasOnMouseMove(event)}
            onMouseDown={(event)=>canvasOnMouseDown(event)} 
            onMouseUp={(event)=>canvasOnMouseUp(event)}
            onDoubleClick={(event) => canvasOnDblclick(event) }> 
            </canvas>
        </div>
    </>)
}