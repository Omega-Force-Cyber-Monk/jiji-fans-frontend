import { ThemeConfig } from "antd";

export const mainTheme: ThemeConfig = {
  token: {
    colorPrimary: "#00B05A",
    colorInfo: "#61D0FF",
    colorBgElevated: "var(--secondary-bg)", 
    colorText: "var(--primary-text)",
  },
  components: {
    // Table: {
    //   headerBorderRadius: 0,
    //   headerBg: "#FAFAFA",
    //   colorBgContainer: "#ffffff",
    //   colorText: "#1F2852",
    //   borderColor: "#FAFAFA",
    //   headerColor: "#1F2852",
    //   footerColor: "rgba(31, 41, 55, 0.88)",
    //   marginXXS: 4,
    //   colorLinkActive: "rgb(107, 114, 128)",
    //   headerSplitColor: "rgb(107, 114, 128)",
    // },
    //   Menu: {
    //     iconSize: 24,
    //     itemActiveBg: "#1F2852",
    //     itemHoverColor: "#ffffff",
    //     itemColor: "#ffffff",
    //     itemSelectedBg: "#1F2852",
    //     itemSelectedColor: "#ffffff",
    //   },
    Button: {
      // defaultHoverBg: "#00000",
      // defaultHoverColor: "#FFFFFF",
      // defaultBorderColor: "#4A90E2",
      // defaultColor: "#4A90E2",
      // defaultActiveBg: "#65000b",
      // defaultActiveColor: "#FFFFFF",
      //   contentFontSizeLG: 18,
      // colorLink: "#4A90E2",
      // colorLinkHover: "#4A90E2",
      colorText: "#4A90E2",
      controlHeightLG: 48,
      borderRadiusLG: 3,

      //   borderRadius: 8,
      //   borderRadiusSM: 8,
      //   primaryShadow: "0 0px 0 rgba(5, 145, 255, 0.1)",
    },
    //   Form: {
    //     labelColor: "rgb(255, 255, 255)",
    //   },
    Input: {
      controlHeightLG: 48,
      borderRadiusLG: 5,
      colorBgContainer: "var(--secondary-bg)",
      colorText: "var(--primary-text)",
      colorTextPlaceholder: "var(--muted-text)",
    },
    Select: {
      controlHeightLG: 48,
      borderRadiusLG: 5,
      colorBgContainer: "var(--secondary-bg)",
      colorText: "var(--primary-text)",
    },

    DatePicker: {
      //   colorBorder: "#61D0FF",
      //   colorTextPlaceholder: "black",
      controlHeightLG: 48,
      borderRadiusLG: 5,
    },
    // InputPassword: {
    //   controlHeightLG: 56,
    //   colorBorder: "#69458B",

    //   activeBg: "rgb(255, 255, 255)",
    //   colorIcon: "#1F2852",
    //   colorTextPlaceholder: "#1F285277",
    //   activeBorderColor: "#1F2852",
    // },
    InputNumber: {
      controlHeightLG: 48,
      borderRadiusLG: 5,
    },
    //   DatePicker: {
    //     activeBg: "rgba(255, 255, 255, 0)",
    //     colorIcon: "rgb(255, 255, 255)",
    //     colorTextPlaceholder: "rgba(250, 244, 244, 0.25)",
    //   },
    Table: {
      colorTextHeading: "#758DFF",
      // colorBgContainer: "#FFFFFF66",
      // colorText: "#ffffff",
      headerBg: "#00B05A",
      headerColor: "#ffffff",
      headerBorderRadius: 0,
      borderRadius: 0,
      headerSplitColor: "none",
    },
    // Modal: {
    //   contentBg: "#5271FF",
    // },
  },
};
