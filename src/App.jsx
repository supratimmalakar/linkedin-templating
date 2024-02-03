import { useState, useRef, useEffect } from "react";
import "./App.css";
import { Button, Card, Upload, Input, Checkbox, notification } from "antd";
import Papa from "papaparse";
import styled from "styled-components";
import { v4 as uuidv4} from 'uuid';

const StyledTextArea = styled.textarea`
  height: 40vh;
  padding: 30px;
`;

const StyledContainer = styled.div`
  display: flex;
  gap: 30px;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 95vh;
  width: calc(50vw - 30px);
  overflow-y: auto;
  background-color: transparent;
`;

const StyledCard = styled(Card)`
  height: 150px;
  background-color: gray;
  .ant-card-body {
    padding: 10px;
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
  }
`;

const StyledForm = styled.div`
  display: flex;
  width: 50vw;
  flex-direction: column;
  gap: 10px;
  .row-1 {
    display: flex;
    gap: 10px;
  }
`;

function App() {
  const [recieverObjs, setRecieverObjs] = useState(
    localStorage.getItem("list")
      ? [...JSON.parse(localStorage.getItem("list"))]
      : []
  );
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [link, setLink] = useState("");
  const [template, setTemplate] = useState(localStorage.getItem("template") || "");
  const input1 = useRef(null);
  const input2 = useRef(null);
  const input3 = useRef(null);
  const input4 = useRef(null);

  const onUpload = (file) => {
    Papa.parse(file.file.originFileObj, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (
          results.meta.fields.includes("name") &&
          results.meta.fields.includes("title") &&
          results.meta.fields.includes("link") &&
          results.meta.fields.includes("company")
        ) {
          setRecieverObjs((prev) => [
            ...results.data.map((obj) => ({
              ...obj,
              checked: false,
              id: uuidv4(),
            })),
          ]);
        }
      },
    });
  };

  const handleAdd = () => {
    if (name === "" || link === "" || company === "" || title === "") return;
    setRecieverObjs((prev) => [
      ...prev,
      { name, title, company, link, checked: false, id: uuidv4() },
    ]);
    setCompany("");
    setName("");
    setLink("");
    setTitle("");
  };

  const handleCopy = (obj) => {
    obj.name = obj.name.split(' ')[0];
    const splitArray = template.split('{{').join('}}').split('}}')
    const variableArray = splitArray.filter((item, idx) => idx % 2 !== 0);
    const textArray = splitArray.filter((item, idx) => idx % 2 === 0);
    const finalText = textArray.reduce((accum, current, idx) => {
      const variable = obj[variableArray[idx]] || "";
      return accum + current + variable
    }, "");
    navigator.clipboard.writeText(finalText)
    notification.success({
      message: "Text copied",
      duration: 1000,
    })
  };

  const handleCheck = (index, checked) => {
    setRecieverObjs((prev) => [
      ...prev.map((obj, idx) => {
        const finalObj = idx === index ? Object.assign(obj, { checked }) : obj;
        return finalObj;
      }),
    ]);
  };

  useEffect(() => {
    const arrayString = JSON.stringify(recieverObjs);
    localStorage.setItem("list", arrayString);
  }, [recieverObjs]);

  const downloadCSV = (items) => {
    let csv;

    for (let row = 0; row < items.length; row++) {
      let keysAmount = Object.keys(items[row]).length;
      let keysCounter = 0;

      if (row === 0) {
        for (let key in items[row]) {
          csv += key + (keysCounter + 1 < keysAmount ? "," : "\r\n");
          keysCounter++;
        }
      } else {
        for (let key in items[row]) {
          csv +=
            items[row][key] + (keysCounter + 1 < keysAmount ? "," : "\r\n");
          keysCounter++;
        }
      }

      keysCounter = 0;
    }

    let link = document.createElement("a");
    link.id = "download-csv";
    link.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(csv)
    );
    link.setAttribute("download", "template.csv");
    document.body.appendChild(link);
    document.querySelector("#download-csv").click();
  };

  const handleDelete = (id) => {
    setRecieverObjs((prev) => prev.filter((obj) => obj.id !== id))
  };

  return (
    <StyledContainer>
      <StyledForm>
        <Input 
          onPressEnter={() => input2.current.focus()}
          value={name}
          ref={input1}
          placeholder="Name of Recruiter"
          onChange={(e) => setName(e.target.value)}
          style={{}}
        />
        <div className="row-1">
          <Input
            onPressEnter={() => input3.current.focus()}
            value={title}
            ref={input2}
            placeholder="Role"
            onChange={(e) => setTitle(e.target.value)}
            style={{}}
          />
          <Input
            onPressEnter={() => input4.current.focus()}
            value={company}
            ref={input3}
            placeholder="Company"
            onChange={(e) => setCompany(e.target.value)}
            style={{}}
          />
        </div>
        <Input
          onPressEnter={handleAdd}
          value={link}
          ref={input4}
          placeholder="LinkedIn link"
          onChange={(e) => setLink(e.target.value)}
          style={{}}
        />
        <Button type="primary" onClick={handleAdd}>Add</Button>
        <p style={{ textAlign: 'center', color: '#fff'}}>OR</p>
        <div style={{display: 'flex', width: 'fit-content', gap : 10, margin: '0 auto'}}>
          <Upload maxCount={1} onChange={onUpload}>
            <Button type="primary">Import CSV</Button>
          </Upload>
          <Button type="primary" onClick={() => downloadCSV(recieverObjs)}>
            Download CSV
          </Button>
        </div>
        <h3 style={{color: '#fff', marginBottom: 0}}>Your Template</h3>
        <p style={{color: '#fff', marginTop : 5}}>Variables: name, title, company</p>
        <StyledTextArea onChange={(e) => {
          setTemplate(e.target.value)
          localStorage.setItem("template", e.target.value)
          }} 
          value={template}/>
      </StyledForm>
      <StyledList>
        {recieverObjs.map((reciever, index) => (
          <StyledCard key={reciever.id}>
            <Checkbox
              onChange={(e) => handleCheck(index, e.target.checked)}
              checked={reciever.checked}
            />
            <span style={{ width: 100 }}>{reciever.name}</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                width: 150,
              }}
            >
              <span style={{ fontWeight: 500 }}>{reciever.title}</span>
              <span style={{ fontWeight: 300 }}>{reciever.company}</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                width: 150,
              }}
            >
              <Button type="primary" onClick={() => handleCopy(reciever)}>Copy</Button>
              <Button type="primary" onClick={() => handleCheck(index, true)}>
                <a href={reciever.link} target="_blank" rel="noreferrer">
                  Profile Link
                </a>
              </Button>
              <Button type="primary" onClick={() => handleDelete(reciever.id)}>Delete</Button>
            </div>
          </StyledCard>
        ))}
      </StyledList>
    </StyledContainer>
  );
}

export default App;
