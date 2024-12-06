package store

import (
	"context"
	"fmt"
	"os"
	"reflect"
	"strconv"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type GoogleSheetsStore[T Model] struct {
	sheetID string
	tabName string
	service *sheets.Service
}

func NewGoogleSheetsStore[T Model](serviceAccountFile string, sheetID, tabName string) (*GoogleSheetsStore[T], error) {
	ctx := context.Background()
	b, err := os.ReadFile(serviceAccountFile)
	if err != nil {
		return nil, fmt.Errorf("unable to read service account file: %w", err)
	}

	config, err := google.JWTConfigFromJSON(b, sheets.SpreadsheetsScope)
	if err != nil {
		return nil, fmt.Errorf("unable to parse service account file to config: %w", err)
	}

	client := config.Client(ctx)

	service, err := sheets.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve Sheets client: %w", err)
	}

	return &GoogleSheetsStore[T]{
		sheetID: sheetID,
		tabName: tabName,
		service: service,
	}, nil
}

func (s *GoogleSheetsStore[T]) Save(data []T) error {
	var values [][]interface{}
	header := getStructFields[T]()
	values = append(values, header)

	for _, item := range data {
		values = append(values, getStructValues(item))
	}

	_, err := s.service.Spreadsheets.Values.Update(s.sheetID, s.tabName+"!A1", &sheets.ValueRange{
		Values: values,
	}).ValueInputOption("RAW").Do()
	if err != nil {
		return fmt.Errorf("unable to update data in sheet: %w", err)
	}

	return nil
}

func (s *GoogleSheetsStore[T]) Load() ([]T, error) {
	resp, err := s.service.Spreadsheets.Values.Get(s.sheetID, s.tabName+"!A1:Z").Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve data from sheet: %w", err)
	}

	if len(resp.Values) == 0 {
		return []T{}, nil
	}

	var data []T
	for _, row := range resp.Values[1:] {
		item := new(T)
		setStructValues(item, row)
		data = append(data, *item)
	}

	return data, nil
}

func getStructFields[T any]() []interface{} {
	var t T
	val := reflect.ValueOf(t)
	typ := val.Type()

	var fields []interface{}
	for i := 0; i < typ.NumField(); i++ {
		fields = append(fields, typ.Field(i).Tag.Get("json"))
	}
	return fields
}

func getStructValues[T any](item T) []interface{} {
	val := reflect.ValueOf(item)
	var values []interface{}
	for i := 0; i < val.NumField(); i++ {
		values = append(values, val.Field(i).Interface())
	}
	return values
}

func setStructValues[T any](item *T, values []interface{}) error {
	val := reflect.ValueOf(item).Elem()
	for i := 0; i < val.NumField(); i++ {
		if i < len(values) {
			field := val.Field(i)
			if field.CanSet() {
				value := values[i]
				fieldType := field.Type()

				// Convert value to the appropriate type
				convertedValue, err := convertValue(value, fieldType)
				if err != nil {
					return fmt.Errorf("error converting value: %w", err)
				}

				field.Set(convertedValue)
			}
		}
	}
	return nil
}

func convertValue(value interface{}, targetType reflect.Type) (reflect.Value, error) {
	valueType := reflect.TypeOf(value)

	if valueType == targetType {
		return reflect.ValueOf(value), nil
	}

	switch targetType.Kind() {
	case reflect.String:
		return reflect.ValueOf(fmt.Sprintf("%v", value)), nil
	case reflect.Float64:
		switch v := value.(type) {
		case string:
			floatVal, err := strconv.ParseFloat(v, 64)
			if err != nil {
				return reflect.Value{}, fmt.Errorf("cannot convert string to float64: %w", err)
			}
			return reflect.ValueOf(floatVal), nil
		case float64:
			return reflect.ValueOf(v), nil
		case int:
			return reflect.ValueOf(float64(v)), nil
		}
	case reflect.Int:
		switch v := value.(type) {
		case string:
			intVal, err := strconv.Atoi(v)
			if err != nil {
				return reflect.Value{}, fmt.Errorf("cannot convert string to int: %w", err)
			}
			return reflect.ValueOf(intVal), nil
		case int:
			return reflect.ValueOf(v), nil
		case float64:
			return reflect.ValueOf(int(v)), nil
		}
	}

	return reflect.Value{}, fmt.Errorf("unsupported conversion from %v to %v", valueType, targetType)
}
