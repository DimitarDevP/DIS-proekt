import React, { useEffect, useState } from "react"
import Compressor from 'compressorjs'

const File = props => {

    const [file, setFile] = useState(props.value?.file === undefined ? false : props.value.file)
    const [preview, setPreview] = useState("")
    const [comment, setComment] = useState(props.value?.comment === undefined ? "" : props.value.comment)

    const handleFileSelect = e => {
        e.preventDefault()
        e.target.nextSibling.click()
    }

    useEffect(() => {
        if (file === false || file === undefined) return
        if (props.withPreview === true && file !== false) setPreview(window.URL.createObjectURL(file[0]))
        if(props.accept.includes("image") === true) {
            new Compressor(file[0], {
                quality: 0.3,
                success(f) {
                    props.handleChange({
                        target: {
                            name: props.name,
                            value: {file: f, comment},
                            type: "file"
                        }
                    })
                }
            })
        } else {
            let ret
            if (props.multiple === false) ret = file[0]
            else ret = file

            props.handleChange({
                target: {
                    name: props.name,
                    value: { file : ret, comment },
                    type: "file"
                }
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comment, file])

    const clear = e => {
        e.preventDefault(e)

        setFile(false)
        setPreview("")
        setComment("")
        const event = {
            target: {
                name: props.name,
                value: {
                    file: false,
                    comment: ""
                },
                type: "file"
            }
        }
        props.handleChange(event)
    }

    return (
        <span className={"file" + " " + props.alternateClass}>
            <p>{props.label}</p>
            <button onClick={e => handleFileSelect(e)}>{props.descriptor === undefined ? "Choose File" : props.descriptor}</button>
            <input type="file" multiple={props.multiple} name={props.name} accept={props.accept} onChange={e => setFile(e.target.files)} />
            {preview !== "" || props.defaultPreview !== "" ? (
                <React.Fragment>
                    {props.withPreview === false ? "File(s) Attached" : (<img alt="preview" src={preview === "" && props.defaultPreview !== "" ? props.defaultPreview : preview} />)}
                    {props.withComment ? <textarea value={comment} name={props.name + "_comment"} onChange={e => setComment(e.target.value)} /> : ""}
                </React.Fragment>
            ) : file[0]?.name}
            {file !== false ? <button onClick={e => clear(e)}>Clear</button> : null}
            {props.alert !== "" ? <p className={props.alert?.includes("already exists") || props.alert?.includes("optional") ? "waring fieldAlert" : "fieldAlert"}>{props.alert}</p> : null}
            {/* {props.alert === "" || props.alert === undefined ? null : <p className="fieldAlert">{props.alert}</p>} */}
            
        </span>
    )

}


export default File