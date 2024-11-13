export const dobProps = {
    openPickerButton: {
        sx: {
            color: 'white',
        }
    },
    actionBar: {
        actions: ['cancel', 'clear', 'accept'],
    },
    layout: {
        sx: {
            '& .MuiPickersLayout-root': {
                bgcolor: '#1F2937',
            },
            '& .MuiPickersCalendarHeader-root': {
                color: 'white',
            },
            '& .MuiPickersCalendarHeader-label': {
                color: 'white',
            },
            '& .MuiDayCalendar-header': {
                color: 'white',
            },
            '& .MuiPickersDay-root': {
                color: 'white',
                '&:hover': {
                    bgcolor: 'blue',
                },
                '&.Mui-selected': {
                    bgcolor: 'green',
                    '&:hover': {
                        bgcolor: 'green',
                    }
                },
                '&.Mui-current': {
                    bgcolor: 'red',
                    '&:hover': {
                        bgcolor: 'blue',
                    }
                }
            },
            // Style year/month views
            '& .MuiPickersYear-root': {
                color: 'white',
            },
            '& .MuiPickersMonth-root': {
                color: 'white',
            }
        }
    },
    // Style the paper/modal that contains the calendar
    desktopPaper: {
        sx: {
            bgcolor: '#1F2937',
            // Add weekday label styling here as well for redundancy
            '& .MuiDayCalendar-weekDayLabel': {
                color: 'white',
            },
            '& .MuiDialogActions-root': {
                bgcolor: '#1F2937',
            },
            '& .MuiPickersCalendarHeader-switchViewButton': {
                color: 'white',
            },
            '& .MuiPickersArrowSwitcher-button': {
                color: 'white',
            },
            '& .MuiPickersYear-yearButton': {
                color: 'white',
                '&.Mui-selected': {
                    bgcolor: 'green',
                },
                '&:hover': {
                    bgcolor: 'blue',
                },
            },
            '& .MuiPickersMonth-monthButton': {
                color: 'white',
                '&.Mui-selected': {
                    bgcolor: 'green',
                },
                '&:hover': {
                    bgcolor: 'blue',
                },
            }
        }
    },
    actionBar: {
        actions: ['cancel', 'clear', 'accept'],
        sx: {
            bgcolor: '#1F2937',
            '& .MuiButton-root': {
                color: 'white',
            }
        }
    },
    toolbar: {
        hidden: false,
        sx: {
            bgcolor: '#1F2937',
            '& .MuiTypography-root': {
                color: 'white',
            },
            '& .MuiPickersCalendarHeader-switchViewButton': {
                color: 'white',
            },
            '& .MuiPickersArrowSwitcher-button': {
                color: 'white',
            }
        },
    },
    tabs: {
        hidden: false,
        sx: {
            bgcolor: '#1F2937',
            '& .MuiTab-root': {
                color: 'white',
            },
            '& .Mui-selected': {
                color: 'white',
            }
        }
    },
    // Style the day elements
    day: {
        sx: {
            color: 'white',
            '&:hover': {
                bgcolor: 'blue',
            },
            '&.Mui-selected': {
                bgcolor: 'green',
                '&:hover': {
                    bgcolor: 'green',
                }
            },
            '&.MuiPickersDay-today': {
                bgcolor: 'red',
                '&:hover': {
                    bgcolor: 'blue',
                }
            }
        }
    },
    // Style the text input
    textField: {
        sx: {
            '& .MuiInputLabel-root': {
                color: 'white',
            },
            '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                    borderColor: 'white',
                },
                '&:hover fieldset': {
                    borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                    borderColor: 'white',
                }
            },
            '& .MuiIconButton-root': {
                color: 'white',
            }
        }
    }
}


export const sex = [
    'Female',
    'Male',
];

export const nextOfKinRelationship = [
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Son',
    'Daughter',
    'Spouse',
    'Wife',
    'Husband',
    'Uncle',
    'Aunt',
    'Cousin',
    'Nephew',
    'Niece',
    'Grandfather',
    'Grandmother',
    'Others',
];

export const txProps = {
    color: "white",
    bgcolor: '#051935',
    borderRadius: "10px",
    fontSize: '16px',
    fontStyle: 'bold',
    fontFamily: 'Poppins',
    '&:hover': {

        bgcolor: "#274e61",
    },
    "& .MuiInputBase-input": {
        color: 'white',
    },
    "& .MuiFormHelperText-root": {
        color: 'red',
    },
    "& input:-webkit-autofill": {
        WebkitBoxShadow: '0 0 0 1000px #274e61 inset',
        WebkitTextFillColor: 'white',
    },
};