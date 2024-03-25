import { SetStateAction } from "react"
import { Button } from "react-bootstrap"
import {XLg} from "react-bootstrap-icons"
import { ThisCircleType } from "@/canvas/Canvas"


type MenuProps = {
  setMenu:React.Dispatch<SetStateAction<boolean>>
  ballColor:string
  setBallColor:React.Dispatch<SetStateAction<string>>
  circleArray:Array<ThisCircleType>
  circleKey:number | undefined
}

// Меню выбора цвета шара
const Menu = ({setMenu,ballColor,setBallColor,circleArray,circleKey}: MenuProps) => {
  return (
    <div className={`vh-100 vw-100 top-0 start-0 bg-dark bg-opacity-75 position-fixed d-flex justify-content-center align-items-center`}>
      <div className='d-flex flex-column justify-content-between bg-white rounded pt-2 pb-4' style={{width:'250px',height:'250px'}}>
        {/* Кнопка закрытия меню */}
        <XLg onClick={()=>setMenu(false)}
          className=' mx-2' 
          size={18} 
          style={{alignSelf:'end',cursor:'pointer'}}/>
          {/* Выбор цвета выбранного шара */}
          <label className="d-flex justify-content-center" htmlFor="ballColor">
            <span>Выберите цвет шара:</span>
            <input onChange={(e)=>setBallColor(e.target.value)} value={ballColor}  type="color" name="ballColor" id="ballColor " />
          </label>

          <div className="d-flex justify-content-center">
            {/* Кнопка установки выбранного цвета шара */}
            <Button onClick={()=>{
              if (circleKey !== undefined)
              circleArray[circleKey].color=ballColor
              setMenu(false)
            }} className="w-75">Изменить цвет</Button>
          </div>
      
        </div>
    </div>
  

  )
}

export default Menu