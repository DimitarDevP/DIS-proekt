import { useEffect } from "react"
import { useParams } from  "react-router-dom"

const Print = props => {

    const url = useParams()._url.replaceAll("!", "/")

    useEffect(() => {
        fetch(url)
        .then(res => res.text())
        .then(res => console.log(res))
        const interval = setTimeout(() => {
            // document.getElementById("frame").style.height = document.getElementById("frame").contentWindow.document.documentElement.scrollHeight + 'px';
            let number = url.split("/")[url.split("/").length - 1].split(".")[0]
            document.title = (url.includes("pos/") ? "P.O. " : "Inv. ") + number
            document.getElementById("Nav").style.display = "none"
            window.print()
            document.getElementById("Nav").style.display = "block"
            document.title = "Plastfix Shop"
            
        }, 1500)
        
        return () => {
            clearTimeout(interval)
        }
    }, [])

    return (
        <iframe id="frame" src={url} width="1000px">

        </iframe>
    )
}

export default Print