import React, { useEffect, useState } from 'react';
import { Badge, Calendar, Modal, Button, Input, Radio, List, Popover, Select, Popconfirm } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import axios from 'axios';

const Nfcalendar = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nestedModalVisible, setNestedModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventText, setEventText] = useState('');
  const [selectedRadioValue, setSelectedRadioValue] = useState('success');
  const [events, setEvents] = useState({}); // State variable to store events


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://studio-backend-sigma.vercel.app/admin/calendar');
        console.log('Calendar data:', response.data);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };
    fetchData();
  }, []);
  const handleDateClick = (value) => {
    setSelectedDate(value);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleNestedModalClick = () => {
    setNestedModalVisible(true);
  };

  const closeNestedModal = () => {
    setNestedModalVisible(false);
  };

  const handleAddEvent = async () => {
    console.log(selectedDate, eventText);
    if (selectedDate && eventText) {
      try {
        const response = await axios.post('https://studio-backend-sigma.vercel.app/admin/calendar/add', {
          task: eventText,
          date: selectedDate.format('YYYY-MM-DD'),
          status: 'pending',
          type:selectedRadioValue,
        });
        console.log('Event added successfully:', response.data);
        
      } catch (error) {
        console.error('Error adding event:', error);
      }
    } else {
      console.error('Please select a date and enter an event');
    }
  };

  const handleUpdateEvent = async (dateKey, eventIndex) => {
    try {
      const response = await axios.post('https://studio-backend-sigma.vercel.app/admin/calendar/update', {
        id: events[dateKey][eventIndex]._id,
        date : dateKey,
      });
      console.log('Event updated successfully:', response.data);
      window.location.reload();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  function onChange(e) {
    console.log(`radio checked: ${e.target.value}`);
    setSelectedRadioValue(e.target.value);
  }

  const dateCellRender = (value) => {
    const dateKey = value.format('YYYY-MM-DD');
    const dateEvents = events[dateKey] || [];

    return (
      <div onClick={() => handleDateClick(value)} className="date-cell" style={{ height: '70px' }}>
        {dateEvents.map((item, index) => (
          <Badge key={index} status={item.type} text={item.content} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={{ width: '75%', margin: '0 auto' }}>
        <Calendar dateCellRender={dateCellRender} />
      </div>
      <Modal
        title={`Events for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}`}
        open={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="nestedModalButton" onClick={handleNestedModalClick}>
            Add Event
          </Button>,
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        {selectedDate && (
          <div>
            <p>Date: {selectedDate.format('YYYY-MM-DD')}</p>
            <List className="events">
              {events[selectedDate.format('YYYY-MM-DD')]?.map((item, index) => (
                <Badge.Ribbon 
                text={item.status} 
                color={
                  item.status === 'pending' ? 'yellow' : 
                  item.status === 'in-process' ? 'blue' : 
                  item.status === 'completed' ? 'green' : 'pink' // Default color if status is not recognized
                }
              ><List.Item key={index}>
                  <Badge status={item.type} text={item.content} />
  {(!(item.status==='completed'))?<Popconfirm
    title="Are you sure you want to remove this event?"
    onConfirm={() => handleUpdateEvent(selectedDate.format('YYYY-MM-DD'), index)}
    okText="Yes"
    cancelText="No"
  >
    <Button style={{marginTop:'15px'}}>Update</Button>
  </Popconfirm>:<></>}



                </List.Item></Badge.Ribbon>
              ))}
            </List>
          </div>
        )}
      </Modal>
      <Modal
        title="Event"
        centered
        open={nestedModalVisible}
        onCancel={closeNestedModal}
        footer={[
          <Button key="closeNested" onClick={closeNestedModal}>
            Close
          </Button>,
          <Button key="submit" onClick={handleAddEvent}>
            Add
          </Button>,
        ]}
      >
        <Input
          placeholder="Enter the event"
          prefix={<UnorderedListOutlined />}
          value={eventText}
          onChange={(e) => setEventText(e.target.value)} // Update the eventText state
        />
        <br />
        <br />
        <div>
          <Radio.Group onChange={onChange} defaultValue="success" value={selectedRadioValue}>
            <Radio.Button value="success">Low</Radio.Button>
            <Radio.Button value="warning">Intermediate</Radio.Button>
            <Radio.Button value="error">High</Radio.Button>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
};

export default Nfcalendar;